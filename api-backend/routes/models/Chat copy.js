const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, enum: ["medecin", "patient"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Message || mongoose.model("Chat", ChatSchema);
