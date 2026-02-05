const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  role: {
    type: String,
    enum: ["patient", "medecin"],
    required: true,
  },
//   channel: {
//     type: String,
//     enum: ["email", "sms", "push", "system"],
//     default: "system", // indique le canal utilisé
//   },
  type: {
    type: String,
    enum: [
      "confirmation",
      "modification",
      "annulation",
      'rendezvous_cree',
      "rappel",
      "nouvelle_demande",
      "prochain_evenement",
      "nouveau_rdv", 
      "nouveau_medecin",
    ],
    default: "system",
  },
  subject: {
    type: String, 
  },
  message: {
    type: String,
    required: true,
  },
  metadata: {
    type: Object, 
    default: {},
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
