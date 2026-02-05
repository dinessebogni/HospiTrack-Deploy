const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  readBy: { type: [String], default: [] }, 
});

module.exports = mongoose.model("Chat", ChatSchema);
