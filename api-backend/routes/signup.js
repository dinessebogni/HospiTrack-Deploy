const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/User'); 
const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: divine
 *               email:
 *                 type: string
 *                 example: divine@gmail.com
 *               password:
 *                 type: string
 *                 example: divine
 *     responses:
 *       201:
 *         description: Utilisateur inscrit avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Erreur de validation ou email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Vérifier si l’utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    // Création utilisateur (le password sera hashé automatiquement via le pre-hook)
    const user = new User({ name, email, password, role: role || 'patient' });
    await user.save();

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
