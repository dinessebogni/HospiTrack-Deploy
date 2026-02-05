const Twilio = require("twilio");
const Notification = require("../routes/models/Notification"); 
require("dotenv").config();

const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async ({ to, body, userId }) => {
  try {
    // --- Envoi SMS ---
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log("SMS envoyé:", message.sid);

    // --- Création d'une notification en base ---
    if (userId) {
      await Notification.create({
        user: userId,       
        message: body,     
        type: "sms",       
        read: false,
        date: new Date(),
      });
    }

  } catch (err) {
    console.error("Erreur SMS:", err);
    throw err;
  }
};

module.exports = { sendSMS };
