// routes/hospitalRoutes.js
const express = require('express');
const auth = require('./middlewares/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const Hopital = require('./models/Hopital');
const Medecin = require('./models/Medecin');
const Patient = require('./models/Patients');
const User = require('./models/User');
const RendezVous = require('./models/RendezVous');

// ================= Multer configuration pour stocker les images =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// ================= Swagger Schemas =================
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Hospital:
 *       type: object
 *       required:
 *         - nom
 *         - ville
 *         - telephone
 *         - email
 *         - accreditation
 *       properties:
 *         nom:
 *           type: string
 *           example: "Hôpital Général"
 *         ville:
 *           type: string
 *           example: "Douala"
 *         telephone:
 *           type: string
 *           example: "+237 6 70 00 00 00"
 *         email:
 *           type: string
 *           example: "contact@hopital.com"
 *         accreditation:
 *           type: string
 *           example: "ACCR-123456"
 *         image:
 *           type: string
 *           description: Nom du fichier uploadé
 *           example: "1661234567890-logo-medecine.jpg"
 *         userId:
 *           type: string
 *           description: ID utilisateur créateur
 */

// ================= Routes =================

// POST /api/hopitaux - Créer un hôpital avec image
/**
 * @swagger
 * /hopitaux:
 *   post:
 *     summary: Créer un nouvel hôpital avec upload d'image
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - ville
 *               - telephone
 *               - email
 *               - accreditation
 *             properties:
 *               nom:
 *                 type: string
 *               ville:
 *                 type: string
 *               telephone:
 *                 type: string
 *               email:
 *                 type: string
 *               accreditation:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Hôpital créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       400:
 *         description: Hôpital déjà existant
 *       500:
 *         description: Erreur serveur 
 */ 
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const existing = await Hopital.findOne({ userId: req.user.id });
    if (existing) return res.status(400).json({ message: "Vous avez déjà un hôpital." });

    const { nom, ville, telephone, email, accreditation } = req.body;
    const image = req.file ? req.file.filename : undefined;

    const hopital = new Hopital({
      nom,
      ville,
      telephone,
      email,
      accreditation,
      image,
      userId: req.user.id
    });
    await hopital.save();

    // Mise à jour du rôle de l'utilisateur
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role: "admin-hopital" },
      { new: true }
    );

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Hôpital créé avec succès",
      token,
      role: user.role,
      name: user.name,
      hopital
    });

  } catch (error) {
    console.error("ERREUR CREATION HOPITAL:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/hopitaux - Récupérer tous les hôpitaux
/**
 * @swagger
 * /hopitaux:
 *   get:
 *     summary: Récupérer tous les hôpitaux
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des hôpitaux
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Hospital'
 *       500:
 *         description: Erreur serveur
 */
// router.get('/', auth, async (req, res) => {
//   try {
//     const hopitaux = await Hospital.find();
//     res.json(hopitaux);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Erreur serveur' });
//   }
// });
router.get('/', auth, async (req, res) => {
  try {
    const hopitaux = await Hopital.find();
    res.json(hopitaux);
  } catch (err) {
    console.error('Erreur GET /api/hopitaux:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/hopitaux/:id - Détails d'un hôpital avec ses médecins
/**
 * @swagger
 * /hopitaux/{id}:
 *   get:
 *     summary: Récupérer un hôpital par ID avec ses médecins validés
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôpital
 *     responses:
 *       200:
 *         description: Détails de l'hôpital avec médecins validés
 *       404:
 *         description: Hôpital non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const hopital = await Hopital.findById(req.params.id);
    if (!hopital) return res.status(404).json({ message: 'Hôpital non trouvé' });

    const medecins = await Medecin.find({ hopitalId: hopital._id, statutValidation: 'valide' });
    res.json({ hopital, medecins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/hopitaux/:id/medecins/en-attente
router.get('/:id/medecins/en-attente', auth, async (req, res) => {
  try {
    const hopitalId = req.params.id;
    if (!hopitalId) return res.status(400).json({ message: "hopitalId manquant !" });

    const medecins = await Medecin.find({ hopitalId, statutValidation: 'en_attente' });
    res.json({ medecins });
  } catch (err) {
    console.error("Erreur /:id/medecins/en-attente :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/hopitaux/:id/medecins/en-attente
router.get('/:id/medecins/en-attente', auth, async (req, res) => {
  try {
    const hopitalId = req.params.id;
    if (!hopitalId) return res.status(400).json({ message: "hopitalId manquant !" });

    const medecins = await Medecin.find({ hopitalId, statutValidation: 'en_attente' }).populate('userId', 'name email');
    
    const formatted = medecins.map(m => ({
      _id: m._id,
      nom: m.userId?.name || m.nom,
      service: m.service,
      specialite: m.specialite,
      hopital: m.hopitalId,
      dateInscription: m.createdAt ? m.createdAt.toISOString() : new Date().toISOString(),
    }));

    res.json({ medecins: formatted });
  } catch (err) {
    console.error("Erreur /medecins/en-attente :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /api/hopitaux/:hopitalId/medecins/:medecinId/valider
router.put('/:hopitalId/medecins/:medecinId/valider', auth, async (req, res) => {
  try {
    const { hopitalId, medecinId } = req.params;
    if (!hopitalId || !medecinId) return res.status(400).json({ message: "Paramètres manquants !" });

    const medecin = await Medecin.findById(medecinId);
    if (!medecin) return res.status(404).json({ message: "Médecin non trouvé" });

    medecin.statutValidation = 'valide';
    await medecin.save();

    await User.findByIdAndUpdate(medecin.userId, { role: 'medecin' });

    res.json({ message: "Médecin validé avec succès" });
  } catch (err) {
    console.error("Erreur valider médecin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// PUT /api/hopitaux/:hopitalId/medecins/:medecinId/refuser
router.put('/:hopitalId/medecins/:medecinId/refuser', auth, async (req, res) => {
  try {
    const { hopitalId, medecinId } = req.params;
    if (!hopitalId || !medecinId) return res.status(400).json({ message: "Paramètres manquants !" });

    const medecin = await Medecin.findByIdAndDelete(medecinId);
    if (!medecin) return res.status(404).json({ message: "Médecin non trouvé" });

    // Optionnel : réinitialiser le rôle utilisateur si nécessaire
    await User.findByIdAndUpdate(medecin.userId, { role: 'patient' });

    res.json({ message: "Médecin refusé et supprimé avec succès" });
  } catch (err) {
    console.error("Erreur refuser médecin :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/hopitaux/:id/stats - Statistiques d’un hôpital
/**
 * @swagger
 * /hopitaux/{id}/stats:
 *   get:
 *     summary: Statistiques d'un hôpital
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôpital
 *     responses:
 *       200:
 *         description: Statistiques de l'hôpital
 *       404:
 *         description: Hôpital non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const hopitalId = req.params.id;
    if (!hopitalId) return res.status(400).json({ message: "hopitalId manquant !" });

    const hopital = await Hopital.findById(hopitalId);
    if(!hopital) return res.status(404).json({ message: "Hôpital non trouvé" });

    let stats = { totalPatients: 0, totalDoctors: 0, appointmentsToday: 0, pendingAppointments: 0, appointments: [] };

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate()+1);

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    console.log("Start of week:", startOfWeek);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); 
    console.log("End of week:", endOfWeek);

    const medecinsIds = await Medecin.find({ hopitalId, statutValidation: 'valide' }).distinct('_id');

    // Récupérer les patients ayant eu au moins un rendez-vous confirmé avec ces médecins
    const patientsIds = await RendezVous.distinct('patientId', {
      medecinId: { $in: medecinsIds },
      status: 'confirme'
    });

    stats.totalPatients = patientsIds.length;
    stats.totalDoctors = await Medecin.countDocuments({ statutValidation: 'valide', hopitalId });
    // stats.appointmentsToday = await RendezVous.countDocuments({ date: { $gte: today, $lt: tomorrow }, hopitalId });
    stats.appointmentsToday = await RendezVous.countDocuments({ status: 'confirme', hopitalId });
    stats.pendingAppointments = await RendezVous.countDocuments({ status: 'en_attente', hopitalId });
    // stats.appointments = await RendezVous.find({ hopitalId }).sort({ start: -1 }).limit(20);
    stats.appointments = await RendezVous.find({ hopitalId, start: { $gte: startOfWeek, $lt: endOfWeek }, status: 'confirme'}).sort({ start: 1 });

    res.json(stats);
  } catch(err) {
    console.error("Erreur /:id/stats :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// GET /api/hopitaux/stats/global - Statistiques globales
/**
 * @swagger
 * /hopitaux/stats/global:
 *   get:
 *     summary: Statistiques globales
 *     tags: [Hopitaux]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques globales
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats/global', auth, async (req, res) => {
  try {
    const totalHopitaux = await Hopital.countDocuments();
    const totalMedecins = await Medecin.countDocuments({ statutValidation: 'valide' });
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await RendezVous.countDocuments();
    const appointmentsToday = await RendezVous.countDocuments({
      start: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(24, 0, 0, 0))
      }
    });
    const pendingAppointments = await RendezVous.countDocuments({ status: 'en_attente' });

    res.json({
      totalHopitaux,
      totalMedecins,
      totalPatients,
      totalAppointments,
      appointmentsToday,
      pendingAppointments
    });
  } catch (err) {
    console.error("Erreur /stats/global :", err);
    res.status(500).json({ message: 'Erreur serveur lors du calcul des statistiques globales' });
  }
});

module.exports = router;
