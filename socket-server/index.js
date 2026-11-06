import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({ path: "../.env.local" });
dotenv.config();

const app = express();
const PORT = process.env.SOCKET_PORT || 4001;
const CLIENT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_localconnect_jwt_token_key_fyp_2026";

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "LocalConnect Real-Time Socket Server",
    activeConnections: io.engine.clientsCount,
    timestamp: new Date().toISOString(),
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Map of userId -> Set of socketIds for presence
const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    // Allow unauthenticated connection or fallback with anonymous/guest if needed
    socket.data.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.user = decoded;
    return next();
  } catch (err) {
    console.warn("Socket auth token invalid, proceeding without verified auth:", err.message);
    socket.data.user = null;
    return next();
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  console.log(`[Socket.IO] Client connected: ${socket.id} (User: ${user?.id || "guest"})`);

  // Handle explicit identification if token was not ready during handshake
  socket.on("identify", ({ userId }) => {
    if (!userId) return;
    socket.join(`user:${userId}`);

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("presence:update", {
      userId,
      isOnline: true,
      totalOnline: onlineUsers.size,
    });
  });

  if (user?.id) {
    const userId = user.id;
    socket.join(`user:${userId}`);
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    io.emit("presence:update", {
      userId,
      isOnline: true,
      totalOnline: onlineUsers.size,
    });
  }

  // Join conversation room
  socket.on("conversation:join", ({ conversationId }) => {
    if (!conversationId) return;
    socket.join(`conversation:${conversationId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on("conversation:leave", ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(`conversation:${conversationId}`);
  });

  // Relay chat message
  socket.on("message:send", (payload) => {
    const { conversationId, recipientId, message } = payload;
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit("message:received", message);
    }
    if (recipientId) {
      io.to(`user:${recipientId}`).emit("notification:new_message", {
        conversationId,
        message,
      });
    }
  });

  // Relay typing indicator
  socket.on("typing:start", ({ conversationId, userId, userName }) => {
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit("typing:active", { userId, userName });
    }
  });

  socket.on("typing:stop", ({ conversationId, userId }) => {
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit("typing:inactive", { userId });
    }
  });

  // Relay notification
  socket.on("notification:dispatch", ({ recipientId, notification }) => {
    if (recipientId) {
      io.to(`user:${recipientId}`).emit("notification:received", notification);
    }
  });

  // Relay booking status updates
  socket.on("booking:update", ({ bookingId, customerId, providerId, status, booking }) => {
    if (customerId) {
      io.to(`user:${customerId}`).emit("booking:changed", { bookingId, status, booking });
    }
    if (providerId) {
      io.to(`user:${providerId}`).emit("booking:changed", { bookingId, status, booking });
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.data.user?.id;
    if (userId && onlineUsers.has(userId)) {
      const userSockets = onlineUsers.get(userId);
      userSockets.delete(socket.id);
      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        io.emit("presence:update", {
          userId,
          isOnline: false,
          totalOnline: onlineUsers.size,
        });
      }
    }
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`LocalConnect Socket.IO Server running on port ${PORT}`);
  console.log(`Allowed Origin: ${CLIENT_URL}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`=======================================================`);
});

