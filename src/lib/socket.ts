"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

/**
 * Connect to the Socket.io server with a JWT.
 * Idempotent — if already connected, returns the existing socket.
 */
export function connectSocket(token: string): Socket {
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
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket.io] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.io] Disconnected:", reason);
  });

  // Automatically fetch fresh token on error/reconnect to prevent JWT expiration locks
  socket.on("connect_error", (err) => {
    console.warn("[Socket.io] Connection error:", err.message);
    const freshToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (freshToken && socket) {
      socket.auth = { token: freshToken };
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
