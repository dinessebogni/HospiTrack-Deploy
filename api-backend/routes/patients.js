const express = require('express');
const router = express.Router();
const User = require('./models/User');
const RDV = require('./models/RendezVous');
const Medecin = require('./models/Medecin');
const auth = require('./middlewares/auth'); 

// Endpoint : liste des patients avec infos
/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Liste des patients avec leur médecin et nombre de rendez-vous
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des patients
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   nom:
 *                     type: string
 *                   email:
 *                     type: string
 *                   medecin:
 *                     type: string
 *                     description: Nom du médecin référent
 *                   nbRdv:
 *                     type: number
 *                     description: Nombre de rendez-vous passés
 *       403:
 *         description: Accès interdit (non admin)
 *       500:
 *         description: Erreur serveur
 */
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin-hopital') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const patients = await User.find({ role: 'patient' }).select('name email');

    const result = await Promise.all(
      patients.map(async (patient) => {
        const rdvs = await RDV.find({ patientId: patient._id });
        let medecinNom = null;
        if (rdvs.length > 0) {
          const medecin = await Medecin.findById(rdvs[0].medecinId);
          medecinNom = medecin ? medecin.nom : null;
        }

        return {
          id: patient._id,
          nom: patient.name,
          email: patient.email,
          medecin: medecinNom,
          nbRdv: rdvs.length,
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /patients/{id}:
 *   delete:
 *     summary: Supprimer un patient par ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du patient à supprimer
 *     responses:
 *       200:
 *         description: Patient supprimé avec succès
 *       404:
 *         description: Patient non trouvé
 *       403:
 *         description: Accès interdit (non admin)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin-hopital') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const patient = await User.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient non trouvé' });

    res.json({ message: 'Patient supprimé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
