"use client";
import { io, Socket } from "socket.io-client";
import { api, clearAccessToken, setAccessToken } from "./api/axios";

let socket: Socket | null = null;
let isRefreshingSocketAuth = false;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

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

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket.io] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.io] Disconnected:", reason);
  });

  socket.on("forceLogout", () => {
    clearAccessToken();
    localStorage.removeItem("userSession");
    localStorage.removeItem("workspaceRole");
    window.dispatchEvent(new Event("auth_session_expired"));
    disconnectSocket();
  });

  // Automatically refresh expired token on authentication errors to prevent lockouts
  socket.on("connect_error", async (err) => {
    const isAuthError =
      err.message.includes("Authentication error") ||
      err.message.includes("invalid token") ||
      err.message.includes("no token provided") ||
      err.message.includes("jwt expired");

    if (isAuthError) {
      if (isRefreshingSocketAuth) return;
      isRefreshingSocketAuth = true;

      try {
        const refreshResponse = await api.post('/auth/refresh', {});
        const newAccessToken =
          refreshResponse.data?.data?.accessToken ||
          refreshResponse.data?.accessToken;

        if (newAccessToken && socket) {
          setAccessToken(newAccessToken);
          socket.auth = { token: newAccessToken };
          socket.connect();
        } else {
          disconnectSocket();
        }
      } catch {
        // Session expired or user logged out; cleanly disconnect without repeating errors
        clearAccessToken();
        localStorage.removeItem("userSession");
        window.dispatchEvent(new Event("auth_session_expired"));
        disconnectSocket();
      } finally {
        isRefreshingSocketAuth = false;
      }
    } else {
      console.warn("[Socket.io] Connection error:", err.message);
    }
  });

  socket.on("reconnect_attempt", () => {
    const freshToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (freshToken && socket) {
      socket.auth = { token: freshToken };
    }
  });

  return socket;
}

/** Disconnect and destroy the socket instance. */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("[Socket.io] Disconnected by app.");
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

/** Join a service queue room to receive live queue_update events. */
export function joinServiceRoom(serviceId: string): void {
  socket?.emit("join_service", serviceId);
}
