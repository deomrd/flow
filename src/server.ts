import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import userRoutes from "./users/routes/user.routes";
import transactionRoutes from "./transfer/routes/transaction.route";
import businessRoutes from './business/routes/business.route';
import pointOfSaleRoutes from './business/routes/pointOfSale.routes';
import verificationemailRoutes from "./otp/routes/email.route";
import verificationphoneRoutes from "./otp/routes/phoneVerification.route";
import transferRoutes from "./transfer/routes/transfer.route";
import retraitRoutes from "./retrait/routes/retrait.routes";
import paiementRoutes from "./paiement/routes/paiement.route"
import { errorHandler } from './business/middleware/errorHandler';
import { ErrorRequestHandler } from 'express';


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

// Map pour stocker les utilisateurs connectés
const connectedUsers = new Map<string, string>();

// Middleware CORS
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

// Middleware pour parser JSON avec gestion d’erreur JSON invalide
app.use(express.json({
  limit: "10mb",
  strict: false // Accepte des champs non définis dans les modèles
}));

app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/transfer", transactionRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/point-of-sale', pointOfSaleRoutes);
app.use('/api/verificationEmail', verificationemailRoutes);
app.use('/api/verificationPhone', verificationphoneRoutes);
// route pour envoie
app.use("/api/transfer", transferRoutes);

// route pour retrait
app.use("/api/retrait", retraitRoutes);

// route pour paiement
app.use("/api/paiement", paiementRoutes);

// WebSocket events
io.on("connection", (socket) => {

  socket.on("register", (userId: string) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} registered on socket ${socket.id}`);
  });

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

const jsonErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err && err.message === "Invalid JSON") {
    res.status(400).json({ error: "Invalid JSON format" });
    return; // arrêter la fonction ici
  }
  next(err);
};

app.use(jsonErrorHandler);

// Démarrage serveur
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export { io, connectedUsers };
