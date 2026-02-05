require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Hopital = require('./models/Hopital');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospitrack';

async function checkAdmins() {
  try {
    const admins = await User.find({ role: /admin-hopital/i });
    console.log(`Trouvé ${admins.length} admins-hopital`);

    for (const admin of admins) {
      const hospital = await Hopital.findOne({ userId: admin._id });

      if (!hospital) {
        console.warn(`Aucun hopital associé pour admin ${admin.name} (${admin._id})`);
      } else {
        console.log(`Hopital trouvé pour admin ${admin.name}: ${hospital._id}`);
      }
    }
  } catch (err) {
    console.error('Erreur checkAdmins :', err);
  }
}

module.exports = checkAdmins;
