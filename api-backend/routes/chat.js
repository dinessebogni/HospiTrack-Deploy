const express = require("express");
const router = express.Router();
const ChatRoom = require("./models/Room");
const ChatMessage = require("./models/Chat");

// Créer ou récupérer une room
router.post("/room", async (req, res) => {
  const { patientId, medecinId } = req.body;
  try {
    let room = await ChatRoom.findOne({ patientId, medecinId });
    if (!room) room = await ChatRoom.create({ patientId, medecinId });
    res.json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Récupérer messages
router.get("/messages/:roomId", async (req, res) => {
  try {
    const messages = await ChatModel.find({ roomId: req.params.roomId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération messages" });
  }
});

module.exports = router;
