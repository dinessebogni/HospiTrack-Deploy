const mongoose = require('mongoose');

const hopitalSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  ville: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  accreditation: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String }, 
}, { timestamps: true, collection: 'hospitals' }); 

module.exports = mongoose.model('Hopital', hopitalSchema);
