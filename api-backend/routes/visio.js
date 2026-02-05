const express = require('express');
const Visio = require('./models/Visio'); 
const router = express.Router();

router.post('/create', async (req, res) => {
  const { patientId, medecinId, roomName } = req.body;

  if (!patientId || !medecinId) {
    return res.status(400).json({ message: 'Paramètres manquants' });
  }

  try {
    // Générer un nom de room unique si non fourni
    const finalRoomName = roomName || `visio-${medecinId}-${patientId}-${Date.now()}`;

    const visio = await Visio.create({
      patientId,
      medecinId,
      roomName: finalRoomName,
      createdAt: new Date(),
    });

    res.json({
      message: 'Visio créée',
      roomName: finalRoomName,
      visioId: visio._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur création visio' });
  }
});

module.exports = router;
