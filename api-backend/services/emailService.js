const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();

const Notification = mongoose.models.Notification || require("../models/Notification"); 

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Envoi d'un email + enregistrement de la notification
 */
const sendEmail = async ({ userId, role, type, to, subject, text, html, metadata = {} }) => {
  if (!userId || !role || !to || !subject || !text) {
    throw new Error("userId, role, to, subject et text sont obligatoires");
  }

  try {
    const info = await transporter.sendMail({
      from: `"HospiTrack" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email envoyé:", info.messageId);

    // Enregistrement de la notification
    await Notification.create({
      userId,
      role,
      type,
      subject,
      message: text,
      metadata,
      read: false,
    });

    console.log("Notification enregistrée pour l'utilisateur:", userId);
  } catch (err) {
    console.error("Erreur email:", err);
    throw err;
  }
};

module.exports = { sendEmail };
