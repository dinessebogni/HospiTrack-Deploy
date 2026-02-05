const express = require('express');
const router = express.Router();
const ContactMessage = require('./models/ContactMessage');  

/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Envoi de messages de contact
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ContactMessage:
 *       type: object
 *       required:
 *         - nom
 *         - email
 *         - sujet
 *         - message
 *       properties:
 *         nom:
 *           type: string
 *           description: Nom de l'expéditeur
 *         email:
 *           type: string
 *           format: email
 *           description: Adresse email de l'expéditeur
 *         sujet:
 *           type: string
 *           description: Sujet du message
 *         message:
 *           type: string
 *           description: Contenu du message
 *       example:
 *         nom: Jean Dupont
 *         email: jean.dupont@example.com
 *         sujet: Demande d'information
 *         message: Bonjour, je voudrais en savoir plus sur vos services.
 */

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Envoyer un message de contact
 *     tags: [Contact]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContactMessage'
 *     responses:
 *       200:
 *         description: Message reçu avec succès
 *       400:
 *         description: Requête invalide
 *       500:
 *         description: Erreur serveur
 */
router.post('/', async (req, res) => {
  const { nom, email, sujet, message } = req.body;

  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    const newMessage = new ContactMessage({ nom, email, sujet, message });
    await newMessage.save();
    res.status(200).json({ message: 'Message reçu' });
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du message:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
