const express = require('express');
const router = express.Router();
const User = require('./models/User'); 
const Medecin = require('./models/Medecin');
const Hopital = require('./models/Hopital');
const authMiddleware = require('./middlewares/auth');

/**
 * @swagger
 * tags:
 *   - name: Utilisateur
 *     description: Gestion du profil utilisateur connecté
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Utilisateur
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    // req.user contient déjà _id, role, medecinId et hopitalId si présents
    const userFromToken = req.user;

    // Récupérer le reste des infos depuis la DB si nécessaire
    const user = await User.findById(userFromToken._id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Fusionner les infos du token et de la DB
    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      medecinId: userFromToken.medecinId || null,
      hopitalId: userFromToken.hopitalId || null,
    };

    res.json(profile);
  } catch (err) {
    console.error("Erreur GET /api/profile:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Modifier le profil de l'utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Utilisateur
 */
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    if (!name && !email && !avatar) {
      return res.status(400).json({ message: 'Au moins un champ doit être fourni' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    console.error('Erreur PUT /api/profile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /profile/{id}:
 *   get:
 *     summary: Récupérer le profil d'un utilisateur spécifique par ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json(user);
  } catch (error) {
    console.error('Erreur GET /api/profile/:id', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

/**
 * @swagger
 * /profile:
 *   delete:
 *     summary: Supprimer le compte utilisateur connecté
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Utilisateur
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Erreur DELETE /api/profile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
