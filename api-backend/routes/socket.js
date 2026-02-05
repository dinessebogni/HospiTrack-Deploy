const { Server } = require("socket.io");
const ChatModel = require("./models/Chat"); 

const setupSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Map userId -> Set(socketId)
  const users = new Map();

  io.on("connection", (socket) => {
    console.log("✅ Nouvel utilisateur connecté :", socket.id);

    // Enregistrer userId -> socketId
    socket.on("registerUser", (userId) => {
      if (!users.has(userId)) users.set(userId, new Set());
      users.get(userId).add(socket.id);
      console.log(`Utilisateur ${userId} enregistré avec socket ${socket.id}`);
    });

    // Rejoindre une room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`📌 Socket ${socket.id} a rejoint la room ${roomId}`);
    });

    // Quitter une room
    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`📤 Socket ${socket.id} a quitté la room ${roomId}`);
    });

    // Réception message
    socket.on("sendMessage", async (msg) => {
      if (!msg.roomId || !msg.senderId || !msg.message) return;

      console.log(`✉️ Message reçu: ${msg.senderName} (${msg.senderId}) pour room ${msg.roomId}`);

      // Sauvegarde MongoDB
      try {
        const saved = await ChatModel.create(msg);
        // Émettre à tous les sockets de la room
        io.to(msg.roomId).emit("receiveMessage", saved);
      } catch (err) {
        console.error("❌ Erreur sauvegarde message :", err);
      }
    });

    // Typing indicator
    socket.on("typing", ({ roomId, userName }) => {
      socket.to(roomId).emit("userTyping", { userName });
    });

    // Read receipts
    socket.on("messageRead", async ({ roomId, messageId, userId }) => {
      try {
        await ChatModel.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
        io.to(roomId).emit("messageRead", { messageId, userId });
      } catch (err) {
        console.error("❌ Erreur read receipt :", err);
      }
    });

    // Déconnexion
    socket.on("disconnect", () => {
      console.log("❌ Socket déconnecté :", socket.id);
      for (const [userId, sockets] of users.entries()) {
        sockets.delete(socket.id);
        if (sockets.size === 0) users.delete(userId);
      }
    });
  });
};

module.exports = setupSocketServer;
