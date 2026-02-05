const express = require('express');
const mongoose = require('mongoose');
const auth = require('./middlewares/auth');
const Evenement = require('./models/Evenement');
const Medecin = require('./models/Medecin');
const router = express.Router();

// Helper pour convertir en ISO string valide
function safeDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

/**
 * @swagger
 * tags:
 *   name: Evenements
 *   description: Gestion des événements de médecins
 */

/**
 * @swagger
 * /evenements/{medecinId}:
 *   get:
 *     summary: Récupérer les événements d’un médecin
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medecinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du médecin
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evenement'
 *       500:
 *         description: Erreur serveur
 */
router.get('/:medecinId', auth, async (req, res) => {
  try {
    const { medecinId } = req.params;
    console.log("medecinId reçu :", medecinId);

    // Vérifie que l'ID est valide
    if (!mongoose.Types.ObjectId.isValid(medecinId)) {
      return res.status(400).json({ message: 'medecinId invalide' });
    }

    // Récupère tous les événements pour ce médecin
    let events = await Evenement.find({ medecinId }).lean();
    console.log("Événements filtrés :", events);

    // Convertit les dates en ISO string pour FullCalendar
    events = events.map(ev => ({
      ...ev,
      start: safeDate(ev.start),
      end: safeDate(ev.end),
    }));

    res.json(events);
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /evenements/jour/{medecinId}:
 *   get:
 *     summary: Récupérer les événements d’un médecin pour le jour courant
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: medecinId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID du médecin
 *     responses:
 *       200:
 *         description: Liste des événements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evenement'
 *       500:
 *         description: Erreur serveur
 */
// Route GET /evenements/jour/:medecinId
router.get("/jour/:medecinId", auth, async (req, res) => {
  try {
    const { medecinId } = req.params;

    // Date d’aujourd’hui en UTC
    const now = new Date();
    const startOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ));
    const endOfDay = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23, 59, 59, 999
    ));

    // console.log("startOfDay UTC:", startOfDay);
    // console.log("endOfDay UTC:", endOfDay);

    const evenements = await Evenement.find({
      medecinId: medecinId,
      start: { $gte: startOfDay, $lte: endOfDay },
    });

    // console.log("Événements du jour récupérés:", evenements);

    res.json(evenements);
  } catch (error) {
    console.error("Erreur API /evenements/jour:", error);
    console.error(error.stack);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /evenements:
 *   post:
 *     summary: Créer un nouvel événement (auth requis)
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Evenement'
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 */
router.post('/', auth, async (req, res) => {
  try {
    const { title, start, end, extendedProps } = req.body;
    if (!title || !start || !end) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    // Récupérer le médecin lié à l'utilisateur connecté
    const medecin = await Medecin.findOne({ userId: req.user.id });
    if (!medecin) return res.status(404).json({ message: 'Médecin introuvable' });

    const newEvent = new Evenement({
      title,
      start: safeDate(start),
      end: safeDate(end),
      extendedProps: {
        type: extendedProps?.type || 'Consultation',
        visibilite: extendedProps?.visibilite || 'Médecin seulement',
        notification: extendedProps?.notification ?? true,
        notificationTime: extendedProps?.notificationTime ?? 15,
      },
      medecinId: medecin._id, 
    });

    await newEvent.save();

    res.status(201).json({
      message: 'Événement créé',
      evenement: {
        ...newEvent.toObject(),
        start: safeDate(newEvent.start),
        end: safeDate(newEvent.end),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /evenements/{id}:
 *   put:
 *     summary: Modifier un événement (auth requis)
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path 
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'événement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Evenement'
 *     responses:
 *       200:
 *         description: Événement mis à jour
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Événement non trouvé
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, start, end, extendedProps } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    const existing = await Evenement.findById(id);
    if (!existing) return res.status(404).json({ message: 'Événement non trouvé' });

    // Vérifier que l'utilisateur connecté est bien le médecin lié à l'événement
    const medecin = await Medecin.findOne({ userId: req.user.id });
    if (!medecin || existing.medecinId.toString() !== medecin._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    // Met à jour les champs
    existing.title = title;
    existing.start = start;
    existing.end = end;
    existing.extendedProps = {
      type: extendedProps?.type || 'Consultation',
      visibilite: extendedProps?.visibilite || 'Médecin seulement',
      notification: extendedProps?.notification ?? true,
      notificationTime: extendedProps?.notificationTime ?? 15,
    };

    await existing.save();

    res.json({
      message: 'Événement mis à jour',
      evenement: {
        ...existing.toObject(),
        id: existing._id.toString(),
        start: safeDate(existing.start),
        end: safeDate(existing.end),
      },
    });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /evenements/{id}:
 *   delete:
 *     summary: Supprimer un événement (auth requis)
 *     tags: [Evenements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement supprimé
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Événement non trouvé
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const existing = await Evenement.findById(id);
    if (!existing) return res.status(404).json({ message: 'Événement non trouvé' });

    // Vérifier que l'utilisateur est bien le médecin
    const medecin = await Medecin.findOne({ userId: req.user.id });
    if (!medecin || existing.medecinId.toString() !== medecin._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await Evenement.findByIdAndDelete(id);

    res.json({ message: 'Événement supprimé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
