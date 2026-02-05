"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Admin/Navbar";
import Sidebar from "../../../components/Admin/Sidebar";

interface Patient {
  id: string;
  nom: string;
  email: string;
  medecin: string;
  nbRdv: number;
}

const API_URL = "http://localhost:8000/api/patients"; 

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Erreur lors du chargement des patients");
      const data: Patient[] = await res.json();
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const supprimerPatient = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce patient ?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/patients/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("Erreur lors de la suppression");
      setPatients((prev) => prev.filter((p) => p.id !== id));
      alert("Patient supprimé");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="flex h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Liste des patients</h1>

          {patients.length === 0 ? (
            <p>Aucun patient trouvé</p>
          ) : (
            <ul>
              {patients.map((patient) => (
                <li
                  key={patient.id}
                  className="flex justify-between items-center mb-2 border p-3 rounded shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{patient.nom} ({patient.email})</p>
                    <p className="text-sm text-gray-600">
                      Médecin : {patient.medecin || "Non assigné"} | Rendez-vous : {patient.nbRdv || 0}
                    </p>
                  </div>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => supprimerPatient(patient.id)}
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

export default PatientsPage;
