import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId)  {

    return userSocketMap[userId];
};

// Store online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // ✅ Fixed: Match the exact casing sent by client (userId, not userid)
  const userId = socket.handshake.query.userId;

    

  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User ID registered:", userId);
  }

  // 🔁 Send online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  console.log("Online Users:", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    console.log("Updated Online Users:", Object.keys(userSocketMap));
  });
});


export { io, app, server };
