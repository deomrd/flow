import express from "express";
import { PrismaClient } from '@prisma/client';
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./interfaces/http/routes/userRoutes";
import transferRoutes from "./interfaces/http/routes/transfer.routes";
import userSearchRoutes from "./interfaces/http/routes/userSearchRoutes";

// App & Server Setup
const app = express();
const httpServer = createServer(app);

// WebSocket Setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

const connectedUsers = new Map<string, string>();

// Middleware
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));

app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error("Invalid JSON");
    }
  },
  limit: "10mb"
}));

app.use(express.urlencoded({ extended: true }));

// Routes HTTP
app.use("/api/users", userRoutes);

app.use('/api/search', userSearchRoutes);

app.use("/api/transactions", transferRoutes); 


// WebSocket Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  console.log('IP address:', socket.handshake.address);
  

  // Lorsqu’un utilisateur s’enregistre après login
  socket.on("register", (userId: string) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered on socket ${socket.id}`);
  });

  // Déconnexion
  socket.on("disconnect", () => {
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Gestion des erreurs JSON
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.message === "Invalid JSON") {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next(err);
});

// Port d’écoute
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { io, connectedUsers };