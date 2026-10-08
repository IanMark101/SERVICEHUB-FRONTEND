"use client";
import { io, Socket } from "socket.io-client";
import { clearAccessToken, getAccessToken, refreshAccessTokenOnce } from "./api/axios";
import { clearLegacyAuthStorage, clearSessionHint } from './browserStorage';
import { invalidateApiCache } from './api/responseCache';
import { socketResources } from './api/cachePolicy';

let socket: Socket | null = null;
let removeRecoveryListeners: (() => void) | null = null;

/** API paths are not Socket.io namespaces. Strip only the final API segment,
 * preserving hosts such as api.example.com and any reverse-proxy prefix. */
export function getSocketEndpoint(apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
  const url = new URL(apiUrl, typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin);
  const prefix = url.pathname.replace(/\/api\/?$/, '').replace(/\/$/, '');
  return { url: url.origin, path: `${prefix}/socket.io` };
}

/**
 * Connect to the Socket.io server with a JWT.
 * Idempotent — if already connected, returns the existing socket.
 */
export function connectSocket(token: string): Socket | null {
  if (!token) return null;

  if (socket) {
    // If socket is already created, update its auth token in case the token refreshed
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
    return socket;
  }

  const endpoint = getSocketEndpoint();
  socket = io(endpoint.url, {
    path: endpoint.path,
    auth: { token },
    // Establish live updates over HTTP before attempting a WebSocket upgrade.
    // A proxy that rejects upgrades can still keep the polling connection alive.
    transports: ['polling', 'websocket'],
    tryAllTransports: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  const activeSocket = socket;

  // Catch-all listeners run before feature listeners issue their GETs.
  socket.onAny((event, payload) => invalidateApiCache(socketResources(event, payload), 'socket'));
  let hasConnected = false;
  let warnedAboutOutage = false;

  socket.on("connect", () => {
    if (hasConnected) invalidateApiCache(undefined, 'reconnect');
    hasConnected = true;
    warnedAboutOutage = false;
    if (process.env.NODE_ENV === 'development') console.log("[Socket.io] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    if (process.env.NODE_ENV === 'development') console.log("[Socket.io] Disconnected:", reason);
  });

  socket.on("forceLogout", (payload?: { code?: string }) => {
    if (payload?.code !== 'ACCOUNT_BANNED') {
      clearLegacyAuthStorage();
      clearSessionHint();
    }
      if (payload?.code === "PASSWORD_CHANGED") {
        clearAccessToken();
        localStorage.removeItem("userSession");
        sessionStorage.setItem("servicehub:auth-notice", "password-changed");
        window.dispatchEvent(new Event("auth_session_expired"));
        disconnectSocket();
        window.location.replace('/login?reason=password-changed');
        return;
      }
      if (payload?.code === "ACCOUNT_DELETED") {
        clearAccessToken();
        localStorage.removeItem("userSession");
        localStorage.removeItem("workspaceRole");
        sessionStorage.setItem("servicehub:auth-notice", "account-deleted");
        window.dispatchEvent(new Event("account_deleted"));
        disconnectSocket();
        return;
      }
    if (payload?.code === "ACCOUNT_BANNED") {
      window.dispatchEvent(new Event("account_banned"));
      disconnectSocket();
      return;
    }
    clearAccessToken();
    localStorage.removeItem("userSession");
    localStorage.removeItem("workspaceRole");
    window.dispatchEvent(new Event("auth_session_expired"));
    disconnectSocket();
  });

  // Only an expired access JWT needs refresh. Permission denials and revoked
  // sessions cannot be repaired by rotating credentials.
  socket.on("connect_error", async (err) => {
    if (socket !== activeSocket) return;
    const code = (err as Error & { data?: { code?: string } }).data?.code;
    if (code === "TOKEN_EXPIRED") {
      try {
        const token = await refreshAccessTokenOnce();
        if (socket === activeSocket) {
          activeSocket.auth = { token };
          activeSocket.connect();
        }
      } catch {
        if (socket === activeSocket) disconnectSocket();
      }
    } else if (code === "SESSION_REVOKED") {
      clearAccessToken();
      clearSessionHint();
      window.dispatchEvent(new Event("auth_session_expired"));
      disconnectSocket();
    } else if (code === "ACCOUNT_BANNED") {
      window.dispatchEvent(new Event("account_banned"));
      disconnectSocket();
    } else if (code === "PERMISSION_DENIED") {
      disconnectSocket();
    } else {
      if (!warnedAboutOutage && process.env.NODE_ENV === 'development') {
        console.warn(`[Socket.io] Live updates temporarily unavailable at ${endpoint.url}. Retrying.`, err.message);
      }
      warnedAboutOutage = true;
    }
  });

  // Reconnection events belong to the Manager, not the namespace Socket.
  activeSocket.io.on("reconnect_attempt", () => {
    if (socket !== activeSocket) return;
    const freshToken = getAccessToken();
    if (freshToken) activeSocket.auth = { token: freshToken };
    else disconnectSocket();
  });
  activeSocket.io.on('reconnect_failed', () => {
    if (socket === activeSocket && process.env.NODE_ENV === 'development') {
      console.warn(`[Socket.io] Live updates could not reconnect. Check the backend at ${endpoint.url}.`);
    }
  });

  // A backend restart can outlast the bounded automatic retries. Returning to
  // this tab or reconnecting the network starts a fresh authenticated attempt.
  const recover = () => {
    if (socket !== activeSocket || activeSocket.connected) return;
    const freshToken = getAccessToken();
    if (!freshToken) { disconnectSocket(); return; }
    activeSocket.auth = { token: freshToken };
    activeSocket.connect();
  };
  const onVisible = () => { if (document.visibilityState === 'visible') recover(); };
  window.addEventListener('online', recover);
  window.addEventListener('focus', recover);
  document.addEventListener('visibilitychange', onVisible);
  removeRecoveryListeners = () => {
    window.removeEventListener('online', recover);
    window.removeEventListener('focus', recover);
    document.removeEventListener('visibilitychange', onVisible);
  };

  return socket;
}

/** Disconnect and destroy the socket instance. */
export function disconnectSocket(): void {
  removeRecoveryListeners?.();
  removeRecoveryListeners = null;
  if (socket) {
    socket.removeAllListeners();
    socket.io.removeAllListeners();
    socket.disconnect();
    socket = null;
    if (process.env.NODE_ENV === 'development') console.log("[Socket.io] Disconnected by app.");
  }
}

/** Get the current socket (may be null if not connected). */
export function getSocket(): Socket | null {
  return socket;
}

/** Join a booking chat room. */
export function joinBookingRoom(bookingId: string): void {
  socket?.emit("join_booking", bookingId);
}

/** Join a listing room to receive its provider's paid workload updates. */
export function joinServiceRoom(serviceId: string): void {
  socket?.emit("join_service", serviceId);
}
