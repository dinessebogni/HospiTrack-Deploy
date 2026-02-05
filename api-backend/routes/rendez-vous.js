// routes/rendezvous.js
const express = require('express');
const router = express.Router();
const RendezVous = require('./models/RendezVous');
const Medecin = require('./models/Medecin');
const Hopital = require('./models/Hopital');
const auth = require('./middlewares/auth');
const User = require('./models/User');
const Notification = require('./models/Notification');
const { sendEmail } = require('../services/emailService');

// helper : parse ISO ou string vers Date
function parseDate(input) {
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return d;
}

// associer les patients a un médecin
async function associerPatientAuMedecin(medecinId, patientId) {
  const medecin = await Medecin.findById(medecinId);
  if (!medecin.patients.includes(patientId)) {
    medecin.patients.push(patientId);
    await medecin.save();
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     RendezVous:
 *       type: object
 *       required:
 *         - title 
 *         - start
 *         - end
 *         - medecinId
 *       properties:
 *         title:
 *           type: string
 *         start:
 *           type: string
 *           format: date-time
 *         end:
 *           type: string
 *           format: date-time
 *         patientId:
 *           type: string
 *         medecinId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [en_attente, confirme, annule]
 *         type:
 *           type: string
 *         visibilite:
 *           type: string
 *         notification:
 *           type: boolean
 *         notificationTime:
 *           type: string
 *         createdBy:
 *           type: string
 */

/**
 * @swagger
 * /rendez-vous:
 *   post:
 *     summary: Crée un rendez-vous
 *     security:
 *       - bearerAuth: [] 
 *     tags:
 *       - RendezVous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RendezVous'
 *     responses:
 *       201:
 *         description: Rendez-vous créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RendezVous'
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/', auth, async (req, res) => {
  try {
    console.log("User from token:", req.user);
    const { title, start, end, patientId, medecinId, hopitalId, type, visibilite, notification, notificationTime } = req.body;

    const startDate = parseDate(start);
    const endDate = parseDate(end);

    if (!startDate || !endDate) return res.status(400).json({ message: 'Dates invalides' });
    if (!title || !medecinId) return res.status(400).json({ message: 'title et medecinId requis' });

    const role = req.user.role;
    const status = role === 'patient' ? 'en_attente' : 'confirme';

    // Si hopitalId non fourni, on le récupère via le médecin connecté (utile si c'est un médecin qui crée)
    let finalHopitalId = hopitalId;
    if (!finalHopitalId && role === 'medecin') {
      const medecinConnected = await Medecin.findOne({ userId: req.user.id });
      if (!medecinConnected) return res.status(404).json({ message: 'Médecin introuvable' });
      finalHopitalId = medecinConnected.hopitalId;
    }
    console.log('hopitalId utilisé:', finalHopitalId);
    // Définir patientId selon qui crée le RDV : 
    let finalPatientId = patientId;
    if (role === 'patient') {
      finalPatientId = req.user.id;
    } else if (role === 'medecin' && !patientId) {
      return res.status(400).json({ message: 'patientId requis quand un médecin crée un rendez-vous' });
    }

    // Créer le rendez-vous
    const rdv = await RendezVous.create({
      title,
      start: startDate,
      end: endDate,
      patientId: finalPatientId,
      medecinId,
      hopitalId: finalHopitalId,
      status,
      type,
      visibilite,
      notification,
      notificationTime,
      createdBy: role
    });

    const user = await User.findById(req.user.id); // utilisateur qui crée le RDV
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });

    const medecin = await Medecin.findById(medecinId);
    if (!medecin) return res.status(404).json({ message: 'Médecin introuvable' });

    // Notification pour le médecin concerné
    if (medecin.userId) {
      await Notification.create({
        userId: medecin.userId,
        role: 'medecin',
        type: 'nouvelle_demande',
        subject: 'Nouveau rendez-vous',
        message: `Le patient ${user.name} demande un rendez-vous le ${rdv.start.toLocaleString()}`,
        metadata: { rendezvousId: rdv._id },
      });
    }

    // Notification pour le patient lorsque c'est le médecin qui crée le rendez-vous
    if (role === 'medecin') {
      const patient = await User.findById(finalPatientId);
      if (patient && patient._id) {
        await Notification.create({
          userId: patient._id,
          role: 'patient',
          type: 'rendezvous_cree',
          subject: 'Nouveau rendez-vous créé',
          message: `Le médecin ${medecin.nom} a programmé un rendez-vous le ${rdv.start.toLocaleString()}`,
          metadata: { rendezvousId: rdv._id },
        });
      }
    }

    res.status(201).json(rdv);
  } catch (e) {
    console.error('Create RDV error:', e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /rendez-vous/{id}/confirm:
 *   put:
 *     summary: Confirme un rendez-vous (médecin/admin)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - RendezVous
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous confirmé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RendezVous'
 *       403:
 *         description: Non autorisé
 *       404:
 *         description: RDV introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    if (!['medecin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const rdv = await RendezVous.findByIdAndUpdate(
      req.params.id,
      { status: 'confirme' },
      { new: true }
    );

    if (!rdv) return res.status(404).json({ message: 'RDV introuvable' });

    // Récupérer l'email du patient
    const patient = await User.findById(rdv.patientId);
    if (patient && patient.email) {
      await sendEmail({
        userId: patient._id,
        role: 'patient',
        type: 'confirmation',
        to: patient.email,
        subject: 'Rendez-vous confirmé',
        text: `Votre rendez-vous "${rdv.title}" a été confirmé.`,
        metadata: { rendezvousId: rdv._id }
      });
    }

    res.json(rdv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /rendez-vous/{id}/cancel:
 *   put:
 *     summary: Annule un rendez-vous
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - RendezVous
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du rendez-vous
 *     responses:
 *       200:
 *         description: Rendez-vous annulé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RendezVous'
 *       404:
 *         description: RDV introuvable
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const rdv = await RendezVous.findByIdAndUpdate(
      req.params.id,
      { status: 'annule' },
      { new: true }
    );

    if (!rdv) return res.status(404).json({ message: 'RDV introuvable' });

    // Récupérer l'email du patient
    const patient = await User.findById(rdv.patientId);
    if (patient && patient.email) {
      await sendEmail({
        userId: patient._id,
        role: 'patient',
        type: 'annulation',
        to: patient.email,
        subject: 'Rendez-vous annulé',
        text: `Votre rendez-vous "${rdv.title}" a été annulé.`,
        metadata: { rendezvousId: rdv._id }
      });
    }

    res.json(rdv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /rendez-vous:
 *   get:
 *     summary: Liste des rendez-vous pour l'utilisateur connecté (filtrage par rôle)
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - RendezVous
 *     responses:
 *       200:
 *         description: Liste des rendez-vous
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RendezVous'
 *       500:
 *         description: Erreur serveur
 */
router.get('/', auth, async (req, res) => {
  try {
    // retrouver le medecin correspondant au user connecté
    const medecin = await Medecin.findOne({ userId: req.user.id });
    if (!medecin) {
      return res.status(404).json({ message: "Médecin introuvable" });
    }

    // chercher les rendez-vous de ce medecin
    const rendezvous = await RendezVous.find({ medecinId: medecin._id })
      .sort({ start: 1 })
      .populate({ path: 'patientId', select: 'name email', model: 'User' })
      .populate({ path: 'medecinId', select: 'nom specialite service', model: 'Medecin' });

    // reformater pour avoir patient et medecin directement
    const formatted = rendezvous.map(rv => ({
      ...rv.toObject(),
      patient: rv.patientId,
      medecin: rv.medecinId,
    }));

    res.json(formatted);
    console.log('Fetched rendezvous:', formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /hopital/{hopitalId}:
 *   get:
 *     summary: Récupère tous les rendez-vous des médecins d'un hôpital
 *     tags:
 *       - RendezVous
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hopitalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'hôpital
 *     responses:
 *       200:
 *         description: Liste des rendez-vous récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: 68b378ee6a71c02388543838
 *                   title:
 *                     type: string
 *                     example: "Rendez-vous avec Dr Carelle"
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-02T01:21:00.000Z"
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-09-02T01:51:00.000Z"
 *                   patientId:
 *                     type: string
 *                     example: 68b355cab05295cb69c38d78
 *                   medecinId:
 *                     type: string
 *                     example: 68b06e3e6183711d9e8e3f6a
 *                   status:
 *                     type: string
 *                     example: "en_attente"
 *                   notification:
 *                     type: boolean
 *                     example: true
 *                   notificationTime:
 *                     type: integer
 *                     example: 15
 *                   createdBy:
 *                     type: string
 *                     example: "patient"
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-08-30T22:19:26.031Z"
 *       403:
 *         description: Accès interdit (non admin ou hôpital incorrect)
 *       404:
 *         description: Aucun RDV ou hôpital introuvable
 *       500:
 *         description: Erreur serveur
 */
router.get('/hopital/:hopitalId', auth, async (req, res) => {
  try {
    const { hopitalId } = req.params;

    const rdvs = await RendezVous.find({ hopitalId })
      .populate({ path: 'medecinId', select: 'nom' })
      .populate({ path: 'patientId', select: 'name' });
    console.log(await RendezVous.find({ hopitalId }).populate('medecinId').populate('patientId'));

    const result = rdvs.map((rdv) => ({
      _id: rdv._id,
      title: rdv.title,
      start: rdv.start,
      end: rdv.end,
      medecinNom: rdv.medecinId ? rdv.medecinId.nom : "Inconnu",
      patientNom: rdv.patientId ? rdv.patientId.name : "Inconnu",
      status: rdv.status,
      notification: rdv.notification,
      notificationTime: rdv.notificationTime,
      createdBy: rdv.createdBy,
      createdAt: rdv.createdAt,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
