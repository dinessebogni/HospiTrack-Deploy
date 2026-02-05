"use client";
import React from "react";
import { Medecin } from "../../hooks/medecin";

interface MedecinPendingTableProps {
  hopitalId: string;
  medecins?: Medecin[];
  onUpdate?: (updatedMedecins: Medecin[]) => void;
}

export default function MedecinPendingTable({
  hopitalId,
  medecins = [],
  onUpdate,
}: MedecinPendingTableProps) {
  const token = localStorage.getItem("token");
  const handleApprove = async (medecin: Medecin) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/hopitaux/${hopitalId}/medecins/${medecin._id}/valider`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Erreur lors de la validation");
      onUpdate && onUpdate(medecins.filter(m => m._id !== medecin._id));
    } catch (err) {
      console.error(err);
      alert("Impossible de valider le médecin.");
    }
  };

  const handleCancel = async (medecin: Medecin) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/hopitaux/${hopitalId}/medecins/${medecin._id}/refuser`,
        { method: "PUT", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Erreur lors du refus");
      onUpdate && onUpdate(medecins.filter(m => m._id !== medecin._id));
    } catch (err) {
      console.error(err);
      alert("Impossible de refuser le médecin.");
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 overflow-x-auto">
      <h2 className="font-semibold mb-4 text-lg">Médecins en attente</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 border-b">
            <th className="p-2">Nom</th>
            <th>Service</th>
            <th>Spécialité</th>
            <th>Date inscription</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medecins.map((m) => (
            <tr key={m._id} className="border-b hover:bg-gray-50">
              <td className="p-2 font-medium">{m.nom}</td>
              <td>{m.service}</td>
              <td>{m.specialite}</td>
              <td>{new Date(m.dateInscription).toLocaleDateString()}</td>
              <td className="space-x-2">
                <button
                  onClick={() => handleApprove(m)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  Valider
                </button>
                <button
                  onClick={() => handleCancel(m)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Refuser
                </button>
              </td>
            </tr>
          ))}
          {medecins.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                Aucune inscription en attente.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
