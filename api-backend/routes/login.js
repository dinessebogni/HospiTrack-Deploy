const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Medecin = require("./models/Medecin");
const Hopital = require("./models/Hopital");
const jwt = require("jsonwebtoken");

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags:
 *       - Authentification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: divine@gmail.com
 *               password:
 *                 type: string
 *                 example: divine
 *     responses:
 *       200:
 *         description: Utilisateur connecté avec succès
 */
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email ou mot de passe manquant" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Mot de passe incorrect" });

    let medecinId = null;
    let hopitalId = null;

    if (user.role.toLowerCase() === "medecin") {
      const medecin = await Medecin.findOne({ userId: user._id });
      if (medecin) {
        medecinId = medecin._id;
        hopitalId = medecin.hopitalId || null;
      }
    }

    if (user.role.toLowerCase() === "admin-hopital") {
      const hospital = await Hopital.findOne({ userId: user._id });
      if (hospital) hopitalId = hospital._id;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, medecinId, hopitalId },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({ 
      message: "Connexion réussie", 
      token, 
      role: user.role, 
      name: user.name,
      medecinId,
      hopitalId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
