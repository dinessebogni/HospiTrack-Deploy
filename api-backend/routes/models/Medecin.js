const mongoose = require('mongoose');

const MedecinSchema = new mongoose.Schema({
  nom: { type: String, required: true }, 
  specialite: { type: String, required: true },
  service: { type: String, required: true },           
  email: { type: String },                             
  telephone: { type: String }, 
  image: { type: String },   
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },                         
  hopitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hopital', required: true },
  statut: { type: String, enum: ['Disponible', 'Occupé'], default: 'Disponible' },
  statutValidation: { type: String, default: 'en_attente' },
}, {
  timestamps: true                                   
}); 

module.exports = mongoose.model('Medecin', MedecinSchema);
