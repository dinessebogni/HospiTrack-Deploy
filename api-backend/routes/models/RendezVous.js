// models/RendezVous.js
const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, 
    start: { type: Date, required: true },
    end:   { type: Date, required: true },

    // Relations
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    medecinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medecin', required: true },
    hopitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hopital', required: true },

    // Statut géré par le rôle créateur  
    status: {
      type: String,
      enum: ['en_attente', 'confirme', 'annule', 'rendezvous_cree'],
      default: 'en_attente',
      index: true
    },
 
    // Métadonnées (optionnel)
    type: String,                 
    visibilite: String,           
    notification: { type: Boolean, default: true },
    notificationTime: { type: Number, default: 15 },
    createdBy: { type: String, enum: ['patient', 'medecin', 'admin'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RendezVous', RendezVousSchema);
