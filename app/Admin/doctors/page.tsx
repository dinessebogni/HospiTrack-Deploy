"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Admin/Navbar";
import Sidebar from "../../../components/Admin/Sidebar";

interface Medecin {
  id: string;
  nom: string;
  specialite: string;
  service: string;
  hopital?: string;
  dateInscription?: string;
  nbPatients?: number;
}

const API_URL = "http://localhost:8000/api/medecins/hopital";

const MedecinsPage: React.FC = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // State pour gérer l'ouverture de la sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const fetchMedecins = async () => {
    try {
      const token = localStorage.getItem("token"); 
      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des médecins");
      const data: Medecin[] = await res.json();
      console.log('medecins de mom hôpital :', data);
      setMedecins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const supprimerMedecin = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce médecin ?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/medecins/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setMedecins((prev) => prev.filter((m) => m.id !== id));
      alert("Médecin supprimé");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    fetchMedecins();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex h-screen">
      {/* Sidebar avec props obligatoires */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        {/* Navbar avec props obligatoires */}
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Médecins de mon hôpital</h1>

          {medecins.length === 0 ? (
            <p>Aucun médecin trouvé</p>
          ) : (
            <ul>
              {medecins.map((med) => (
                <li
                  key={med.id}
                  className="flex justify-between items-center mb-2 border p-3 rounded shadow-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {med.nom} - {med.specialite}
                    </p>
                    {med.dateInscription && (
                      <p className="text-sm text-gray-600">
                        Date d'inscription : {new Date(med.dateInscription).toLocaleDateString()} | Patients : {med.nbPatients || 0}
                      </p>
                    )}
                  </div>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => supprimerMedecin(med.id)}
                  >
                    Supprimer
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default MedecinsPage;
