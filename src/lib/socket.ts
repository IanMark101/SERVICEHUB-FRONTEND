"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001";

/**
 * Connect to the Socket.io server with a JWT.
 * Idempotent — if already connected, returns the existing socket.
 */
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket.io] Connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket.io] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.warn("[Socket.io] Connection error:", err.message);
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
