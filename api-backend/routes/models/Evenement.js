const mongoose = require('mongoose');

const ExtendedPropsSchema = new mongoose.Schema({
  type: { type: String, default: 'Consultation' }, 
  visibilite: { type: String, default: 'Médecin seulement' }, 
  notification: { type: Boolean, default: true },
  notificationTime: { type: Number, default: 15 }, 
}, { _id: false });

const EvenementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  extendedProps: { type: ExtendedPropsSchema, default: () => ({}) },
  medecinId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medecin', required: true },
});

module.exports = mongoose.model('Evenement', EvenementSchema);
