import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/ds.js";

import path from "path"

import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import {app,server} from "./lib/socket.js"

dotenv.config();
// const app = express();
const PORT = process.env.PORT;

const __dirname = path.resolve();

app.use(express.json({ limit: "10mb" })); // or even 20mb
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


app.use(cookieParser());

// ✅ Log separately
// console.log("CORS setup initialized...");
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use("/api/auth", authRoutes); 
app.use("/api/messages", messageRoutes); 

if(process.env.NODE_ENV === "production"){

  app.use(express.static(path.join(__dirname,"../frontend/dist")));

  app.get("*",(req,res) => {
    res.sendFile(path.join(__dirname,"../frontend/dist","index.html"));
  })
}

server.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
  connectDB();
  
});
