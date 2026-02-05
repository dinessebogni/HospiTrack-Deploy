"use client";
import FeatureCard from "./FeatureCard";
import coordIcon from "../public/icones/coordination.png";
import secureIcon from "../public/icones/securite.png";
import infoIcon from "../public/icones/information.png";
import commIcon from "../public/icones/communication.png";

export default function FeaturesList() {
  const features = [
    { icon: coordIcon, title: "Amélioration", description: "de la coordination" },
    { icon: secureIcon, title: "Système", description: "sécurisé" },
    { icon: infoIcon, title: "Gestion de", description: "l’information" },
    { icon: commIcon, title: "Communication", description: "efficace" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
      {features.map((f, i) => (
        <FeatureCard key={i} {...f} />
      ))}
    </div>
  );
}
