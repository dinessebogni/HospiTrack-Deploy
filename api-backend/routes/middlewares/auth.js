const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Medecin = require("../models/Medecin");
const Hopital = require("../models/Hopital");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token manquant ou invalide" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ message: "Utilisateur non trouvé" });

    let medecinId = null;
    let hopitalId = null;

    if (decoded.medecinId) medecinId = decoded.medecinId;
    if (decoded.hopitalId) hopitalId = decoded.hopitalId;

    if (!medecinId && user.role.toLowerCase() === "medecin") {
      const medecin = await Medecin.findOne({ userId: user._id });
      if (medecin) {
        medecinId = medecin._id;
        hopitalId = medecin.hopitalId || null;
      }
    }

    if (!hopitalId && user.role.toLowerCase() === "admin-hopital") {
      const hospital = await Hopital.findOne({ userId: user._id });
      if (hospital) hopitalId = hospital._id;
    }

    req.user = {
      _id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      medecinId,
      hopitalId,
    };

    next();
  } catch (err) {
    console.error("Erreur authMiddleware:", err);
    return res.status(401).json({ message: "Token invalide" });
  }
}

module.exports = authMiddleware;
