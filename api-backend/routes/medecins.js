const express = require('express');
const mongoose = require("mongoose");
const router = express.Router();
const Medecin = require('./models/Medecin'); 
const Hopital = require('./models/Hopital');
const User = require('./models/User');
const RDV = require('./models/RendezVous');
const Message = require('./models/Chat');
const auth = require('./middlewares/auth');  
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');

//  Multer configuration pour stocker les images
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/medecins')),
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

// Swagger Schema 
/**
 * @swagger
 * components:
 *   schemas:
 *     Medecin:
 *       type: object
 *       required:
 *         - nom
 *         - specialite
 *         - service
 *         - hopitalId
 *       properties:
 *         nom:
 *           type: string
 *         email:
 *           type: string
 *           description: Email professionnel (optionnel)
 *         specialite:
 *           type: string
 *         service:
 *           type: string
 *         hopitalId:
 *           type: string
 *         image:
 *           type: string
 *           description: URL de l'image du médecin
 *         statut:
 *           type: string
 *           enum: [Disponible, Occupé]
 *       example:
 *         nom: Dr. Nguema
 *         email: dr.nguema@hopital.com
 *         specialite: Cardiologue
 *         service: Cardiologie
 *         hopitalId: 64dcaf5b1c1a2a001d9c9a9e
 *         image: /uploads/medecins/image.png
 *         statut: Disponible
 */

// Routes 

/**
 * @swagger
 * /medecins:
 *   get:
 *     summary: Obtenir la liste de tous les médecins
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des médecins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medecin'
 */
router.get('/', auth, async (req, res) => {
  try {
    // Populate le champ hopitalId pour récupérer le nom
    const medecins = await Medecin.find()
      .populate('hopitalId', 'nom') 
      .exec();

    // Reformater pour le frontend
    const result = medecins.map(m => ({
      id: m._id.toString(),
      nom: m.nom, 
      service: m.service,
      specialite: m.specialite,
      statut: m.statut,
      hopital: m.hopitalId ? m.hopitalId.nom : '', 
      prochainCreneau: m.prochainCreneau,
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


router.get('/mes-patients', auth, async (req, res) => {
  try {
    const medecinUserId = req.user._id;

    // Trouver le médecin correspondant
    const medecin = await Medecin.findOne({ userId: medecinUserId });
    if (!medecin) return res.status(404).json({ message: "Médecin non trouvé" });

    // Récupérer les rendez-vous de ce médecin
    const rdvs = await RDV.find({ medecinId: medecin._id });
    const patientIdsFromRdvs = rdvs
      .filter(rdv => rdv.patientId)
      .map(rdv => rdv.patientId.toString());

    // Récupérer les messages (ou chats) du médecin
    const chats = await Message.find({ medecinId: medecin._id });
    const patientIdsFromChats = chats
      .filter(chat => chat.patientId)
      .map(chat => chat.patientId.toString());

    // Fusionner sans doublons
    const uniquePatientIds = [...new Set([...patientIdsFromRdvs, ...patientIdsFromChats])];

    // Récupérer les patients dans la collection Users
    const patients = await User.find({
      _id: { $in: uniquePatientIds },
      role: 'patient'
    }).select('name email role');

    res.json(patients);
  } catch (error) {
    console.error('Erreur /mes-patients', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /medecins/hopital:
 *   get:
 *     summary: Obtenir la liste des médecins de l'hôpital de l'admin connecté
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des médecins avec date d'inscription et nombre de patients
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
 *                   specialite:
 *                     type: string
 *                   service:
 *                     type: string
 *                   hopital:
 *                     type: string
 *                   dateInscription:
 *                     type: string
 *                   nbPatients:
 *                     type: number
 */

router.get('/hopital', auth, async (req, res) => {
  try {
    console.log("Utilisateur connecté:", req.user);

    if (req.user.role !== 'admin-hopital') {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    const hopital = await Hopital.findOne({ userId: req.user._id });
    if (!hopital) {
      return res.status(404).json({ message: "Hôpital introuvable pour cet admin" });
    }

    console.log("Hôpital trouvé:", hopital);

    const medecins = await Medecin.find({ hopitalId: hopital._id })
      .populate('hopitalId', 'nom');

    const result = await Promise.all(
      medecins.map(async (med) => {
        const nbPatients = await RDV.countDocuments({ medecinId: med._id });
        return {
          id: med._id.toString(),
          nom: med.nom,
          specialite: med.specialite,
          service: med.service,
          hopital: med.hopitalId ? med.hopitalId.nom : '',
          dateInscription: med.createdAt,
          nbPatients,
        };
      })
    );

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

/**
 * @swagger
 * /medecins/{id}:
 *   get:
 *     summary: Obtenir un médecin par ID
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du médecin
 *     responses:
 *       200:
 *         description: Détails du médecin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medecin'
 *       404:
 *         description: Médecin non trouvé
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const medecin = await Medecin.findById(req.params.id);
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });
    res.json(medecin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /medecins:
 *   post:
 *     summary: Ajouter un nouveau médecin
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               emailPro:
 *                 type: string
 *               specialite:
 *                 type: string
 *               service:
 *                 type: string
 *               hopitalId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Médecin créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medecin'
 *       400:
 *         description: Données invalides 
 *       401:
 *         description: Non autorisé
 */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { nom, emailPro, specialite, service, hopitalId } = req.body;
    const image = req.file ? req.file.filename : undefined;
    if (!nom || !specialite || !service || !hopitalId) {
      return res.status(400).json({ message: "nom, specialite et service sont obligatoires." });
    }

    const nouveauMedecin = new Medecin({
      nom,
      email: emailPro || "",
      specialite,
      service,
      userId: req.user._id,
      hopitalId,
      image,
      statut: "Disponible",
      statutValidation: "en_attente",
    });
    await nouveauMedecin.save();

    await User.findByIdAndUpdate(req.user.id, { role: "medecin" });

    res.status(201).json(nouveauMedecin);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Erreur lors de la création du médecin." });
  }
});

/**
 * @swagger
 * /medecins/{id}:
 *   delete:
 *     summary: Supprimer un médecin par ID
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du médecin à supprimer
 *     responses:
 *       200:
 *         description: Médecin supprimé avec succès
 *       404:
 *         description: Médecin non trouvé
 *       401:
 *         description: Non autorisé
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const medecin = await Medecin.findByIdAndDelete(req.params.id);
    if (!medecin) return res.status(404).json({ message: 'Médecin non trouvé' });
    res.json({ message: 'Médecin supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /medecins/{id}/valider:
 *   put:
 *     summary: Valider un médecin (admin uniquement)
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du médecin à valider
 *     responses:
 *       200:
 *         description: Médecin validé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Medecin'
 *       403:
 *         description: Accès interdit (non admin)
 *       404:
 *         description: Médecin non trouvé
 */
router.put('/:id/valider', auth, async (req, res) => {
  try {
    // Vérifie que seul un admin hopital peut valider
    if (req.user.role !== 'admin-hopital') {
      return res.status(403).json({ message: 'Accès interdit : admin uniquement' });
    }

    const medecin = await Medecin.findByIdAndUpdate(
      req.params.id,
      { statutValidation: 'valide' },
      { new: true }
    );

    if (!medecin) {
      return res.status(404).json({ message: 'Médecin non trouvé' });
    }

    res.json({ message: 'Médecin validé avec succès', medecin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

/**
 * @swagger
 * /medecins/en_attente:
 *   get:
 *     summary: Obtenir la liste des médecins en attente de validation
 *     tags: [Medecins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des médecins en attente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medecin'
 *       403:
 *         description: Accès interdit (non admin)
 */
router.get('/en_attente', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin-hopital') {
      return res.status(403).json({ message: 'Accès interdit : admin uniquement' });
    }

    const medecins = await Medecin.find({ statutValidation: 'en_attente' });
    res.json(medecins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
