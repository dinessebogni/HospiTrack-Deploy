"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../../components/Admin/Sidebar";
import Navbar from "../../../components/Admin/Navbar";
import LoadingSpinner from "../../../components/LoadingSpinner";

interface RDV {
  _id: string;
  title: string;
  start: string;
  end: string;
  patientNom: string;
  medecinNom: string;
  status: string;
  notification: boolean;
  notificationTime: number;
  createdBy: string;
  createdAt: string;
}

const PAGE_SIZE = 15;

export default function RDVAdminPage() {
  const [rdvs, setRdvs] = useState<RDV[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const hopitalId = typeof window !== "undefined" ? localStorage.getItem("hopitalId") : null;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!hopitalId || !token) return;

    const fetchRDVs = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/rendez-vous/hopital/${hopitalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des rendez-vous");
        const data = await res.json();
        setRdvs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRDVs();
  }, [hopitalId, token]);

  const totalPages = Math.ceil(rdvs.length / PAGE_SIZE);
  const paginatedRdvs = rdvs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 bg-gray-100">
          <h1 className="text-2xl font-bold mb-6">Rendez-vous des médecins</h1>

          {loading ? (
            <LoadingSpinner />
          ) : paginatedRdvs.length === 0 ? (
            <p>Aucun rendez-vous trouvé pour cet hôpital.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="py-2 px-4">Titre</th>
                      <th className="py-2 px-4">Médecin</th>
                      <th className="py-2 px-4">Patient</th>
                      <th className="py-2 px-4">Début</th>
                      <th className="py-2 px-4">Fin</th>
                      <th className="py-2 px-4">Statut</th>
                      <th className="py-2 px-4">Notification</th>
                      <th className="py-2 px-4">Créé par</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRdvs.map((rdv) => (
                      <tr key={rdv._id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4">{rdv.title}</td>
                        <td className="py-2 px-4">{rdv.medecinNom}</td>
                        <td className="py-2 px-4">{rdv.patientNom}</td>
                        <td className="py-2 px-4">{new Date(rdv.start).toLocaleString()}</td>
                        <td className="py-2 px-4">{new Date(rdv.end).toLocaleString()}</td>
                        <td className="py-2 px-4">{rdv.status}</td>
                        <td className="py-2 px-4">{rdv.notification ? `Oui (${rdv.notificationTime} min)` : "Non"}</td>
                        <td className="py-2 px-4">{rdv.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination simple */}
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded ${
                    currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded ${
                    currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Suivant
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
