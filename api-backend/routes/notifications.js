const express = require("express");
const router = express.Router();
const auth = require("./middlewares/auth");
const Notification = require("./models/Notification");
const Medecin = require("./models/Medecin");
const { sendEmail } = require("../services/emailService");
const { sendSMS } = require("../services/smsService");

// Récupérer toutes les notifications d'un utilisateur connecté
router.get("/", auth, async (req, res) => {
  try {
    // userId récupéré depuis le token
    const userId = req.user.id;

    // On récupère toutes les notifications pour cet utilisateur, triées par date décroissante
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("Erreur récupération notifications:", err);
    res.status(500).json({ success: false, error: "Impossible de récupérer les notifications" });
  }
});

// Envoit notification marquée comme lu vers read
router.get('/:id/read', auth, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée' });
    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Envoyer une notification
router.post("/send", auth, async (req, res) => {
  const { type, email, phone, customMessage, eventName, eventDate, medecinId } = req.body;
  const { id: userId, role } = req.user;

  if (!role || !type) {
    return res.status(400).json({ success: false, error: "role et type obligatoires" });
  }

  let subject = "Notification HospiTrack";
  let message = "Vous avez une nouvelle notification.";

  let medecinNom = "inconnu";

  // Si on a un medecinId, on récupère le nom depuis la DB
  if (medecinId) {
    try {
      const medecin = await Medecin.findById(medecinId);
      if (medecin) medecinNom = medecin.nom;
    } catch (err) {
      console.error("Erreur récupération médecin:", err);
    }
  }

  // Logique de rôle/type
  if (role === "patient") {
    switch (type) {
      case "confirmation": subject = "Confirmation de rendez-vous"; message = "Votre rendez-vous a été confirmé."; break;
      case "modification": subject = "Modification de rendez-vous"; message = "Votre rendez-vous a été modifié."; break;
      case "annulation": subject = "Annulation de rendez-vous"; message = "Votre rendez-vous a été annulé."; break;
      case "nouveau_rdv": subject = "Nouveau rendez-vous programmé"; message = `Le médecin ${medecinNom || "inconnu"} a programmé un rendez-vous avec vous.`; break;
    }
  } else if (role === "medecin") {
    switch (type) {
      case "rappel": subject = "Rappel de rendez-vous"; message = "Vous avez un rendez-vous prochainement."; break;
      case "nouvelle_demande": subject = "Nouvelle demande de rendez-vous"; message = "Un patient a fait une nouvelle demande."; break;
      case "prochain_evenement":
        subject = `Événement à venir: ${eventName || "inconnu"}`;
        message = `L'événement "${eventName || "inconnu"}" commence à ${
          eventDate
            ? new Date(eventDate).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
            : "heure non précisée"
        }.`; 
        break;
      case "nouveau_medecin":
        // Notification admin d'hôpital pour nouvelle inscription médecin
        if (!hopitalId) return res.status(400).json({ success: false, error: "hopitalId requis pour ce type" });
        const admin = await User.findOne({ role: "admin-hopital", hopitalId });
        if (admin) {
          message = `Un nouveau médecin (${medecinNom}) s'est inscrit et attend votre validation.`;
          subject = "Nouvelle inscription médecin";

          // Créer la notification dans la DB
          await Notification.create({
            userId: admin._id,
            type,
            message,
            medecinId,
            read: false
          });
          if (admin.email) await sendEmail({ to: admin.email, subject, text: message });
          if (admin.phone) await sendSMS({ to: admin.phone, body: message });
        }
        break;
    }
  }

  if (customMessage) message = customMessage;

  try {
    if (email) await sendEmail({ userId, role, type, to: email, subject, text: message });
    if (phone) await sendSMS({ to: phone, body: message }); 

    res.json({ success: true, message: "Notification envoyée et enregistrée" });
  } catch (err) {
    console.error("Erreur envoi:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
