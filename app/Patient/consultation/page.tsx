"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Navbar from "../../../components/Patient/Navbar";
import DisponibiliteTable from "../../../components/Doctor/DisponibiliteTable";
import DisponibiliteFilters from "../../../components/Doctor/DisponibiliteFilters";

type Statut = "Disponible" | "Occupé";

interface MedecinDisponibilite {
  id: string;
  nom: string;
  service: string;
  specialite: string;
  hopital: string;
  statut: Statut;
  prochainCreneau: string;
}

function normalizeStatut(statut: string): Statut {
  switch (statut.toLowerCase()) {
    case "disponible":
      return "Disponible";
    case "occupé":
      return "Occupé";
    default:
      return "Disponible";
  }
}

export default function DisponibilitesPage() {
  const [medecins, setMedecins] = useState<MedecinDisponibilite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentService, setCurrentService] = useState("");
  const [currentSpecialite, setCurrentSpecialite] = useState("");
  const [currentTranche, setCurrentTranche] = useState("");
  const [currentHopital, setCurrentHopital] = useState("");

  useEffect(() => {
    async function fetchMedecins() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Utilisateur non authentifié");

        const res = await fetch("http://localhost:8000/api/medecins", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur lors du chargement des données");

        const data = await res.json();
        console.log("Données des médecins reçues :", data);
        if (!Array.isArray(data)) throw new Error("Format de données inattendu");

        const normalized: MedecinDisponibilite[] = data.map((m: any) => {
          // Récupération des créneaux futurs
          const creneauxFuturs = (m.creneaux || [])
            .map((c: string) => new Date(c))
            .filter((date: Date) => date > new Date()); 

          // Trier du plus proche au plus lointain
          creneauxFuturs.sort((a: Date, b: Date) => a.getTime() - b.getTime());

          // Formater le créneau (français, lisible)
          const prochainCreneau = creneauxFuturs.length > 0
            ? creneauxFuturs[0].toLocaleString("fr-FR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Aucun créneau disponible";

          return {
            id: m.id,
            nom: m.nom,
            service: m.service,
            specialite: m.specialite,
            hopital: m.hopital || "Non spécifié",
            statut: normalizeStatut(m.statut),
            prochainCreneau,
          };
        });

        const medecinsIds = normalized.map((m) => m.id);
        localStorage.setItem("medecinsIds", JSON.stringify(medecinsIds));
        console.log("Médecins normalisés :", normalized);

        setMedecins(normalized);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchMedecins();
  }, []);

  // Filtrage dynamique
  const medecinsFiltres = medecins.filter((m) => {
    return (
      (currentService ? m.service === currentService : true) &&
      (currentSpecialite ? m.specialite === currentSpecialite : true) &&
      (currentHopital ? m.hopital === currentHopital : true) &&
      (currentTranche
        ? (currentTranche === "Matin" && m.prochainCreneau?.includes("08")) ||
          (currentTranche === "Après-midi" && m.prochainCreneau?.includes("13")) ||
          (currentTranche === "Soir" && m.prochainCreneau?.includes("18"))
        : true)
    );
  });

  const handleView = (id: string) => {
    console.log("Voir médecin", id);
    localStorage.setItem("selectedMedecinId", id);
  };

  const handleEdit = (id: string) => console.log("Modifier médecin", id);
  const handleDelete = (id: string) => console.log("Supprimer médecin", id);
  const handleAdd = () => console.log("Ajouter un médecin");

  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <>
        <Navbar />
        <div className="max-w-6xl mx-auto p-6 m-10 bg-white dark:bg-gray-900 rounded-xl shadow text-red-600 dark:text-red-400">
          <h2>Erreur : {error}</h2>
        </div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 m-10 bg-white dark:bg-gray-900 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Consultation des disponibilités
        </h1>

        {/* Filtres dynamiques */}
        <DisponibiliteFilters
          currentService={currentService}
          currentSpecialite={currentSpecialite}
          currentTranche={currentTranche}
          currentHopital={currentHopital}
          onServiceChange={setCurrentService}
          onSpecialiteChange={setCurrentSpecialite}
          onTrancheChange={setCurrentTranche}
          onHopitalChange={setCurrentHopital}
        />

        {/* Table paginée */}
        <DisponibiliteTable
        medecins={medecinsFiltres}
        role = 'patient'
          itemsPerPage={5}
        />
      </div>
    </>
  );
}
