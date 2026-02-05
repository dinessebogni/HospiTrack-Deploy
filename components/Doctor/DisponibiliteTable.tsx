'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaComments, FaVideo } from 'react-icons/fa';

// Types
type Statut = 'Disponible' | 'Occupé';
export interface MedecinDisponibilite {
  id: string;
  nom: string;
  service: string; 
  specialite: string;
  hopital: string;
  statut: Statut;
  prochainCreneau: string;
  creneaux?: { start: string; end: string }[];
}

// Fonction qui défini la disponibilité d'un médecin
type Role = 'patient' | 'medecin' | 'admin';

function getStatutFromAgenda(creneaux: { start: string; end: string }[]): Statut {
  const now = new Date();

  for (const c of creneaux) {
    const start = new Date(c.start);
    const end = new Date(c.end);
    if (now >= start && now <= end) {
      return "Occupé"; // Le créneau chevauche l'heure actuelle
    }
  }

  return "Disponible"; // Aucun créneau en cours
}

// Couleurs selon le statut
const statutCouleurs: Record<Statut, string> = {
  Disponible: 'text-green-600',
  Occupé: 'text-red-600',
};
const statutBulle: Record<Statut, string> = {
  Disponible: 'bg-green-500',
  Occupé: 'bg-red-500',
};

// Props du composant
interface Props {
  medecins: MedecinDisponibilite[];
  role: Role;
  itemsPerPage?: number;
}

export default function DisponibiliteTable({
  medecins,
  role,
  itemsPerPage = 5,
}: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [patientId, setPatientId] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?._id) throw new Error('ID patient manquant');
        setPatientId(data._id);
        setPatientName(data.nom || '');
      })
      .catch(err => console.error('Erreur récupération profil :', err));
  }, []);

  const totalPages = Math.ceil(medecins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = medecins.slice(startIndex, startIndex + itemsPerPage);

  const handleViewRDV = (medecin: MedecinDisponibilite) => {
    router.push(`/Patient/rendezvous/${medecin.id}`);
  };

  const handleOpenChat = (medecin: MedecinDisponibilite) => {
    router.push(`/Patient/chat/${medecin.id}`);
  };

  const handleStartVisio = (medecin: MedecinDisponibilite) => {
    if (!patientId) return console.error('Patient non connecté');

    // Génération du roomName unique
    const roomName = `visio-${patientId}-${medecin.id}-${Date.now()}`;

    // Optionnel : sauvegarde côté backend pour historique
    fetch('http://localhost:8000/api/visio/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomName, patientId, medecinId: medecin.id }),
    }).catch(err => console.error('Erreur création room:', err));

    // Redirection vers la page visio
    router.push(`/Patient/visio/${roomName}`);
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead className="text-left text-gray-900 dark:text-white">
            <tr>
              <th>Médecin</th>
              <th>Service</th>
              <th>Spécialité</th>
              <th>Hôpital</th>
              <th>Statut</th>
              <th>Prochain créneau libre</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-900 dark:text-white">
            {currentItems.map(m => {
              const statutActuel = getStatutFromAgenda(m.creneaux || []);
              return (
                <tr key={m.id} className="rounded-lg shadow-sm">
                  <td className="py-2">{m.nom}</td>
                  <td>{m.service}</td>
                  <td>{m.specialite}</td>
                  <td>{m.hopital}</td>
                  <td className={`flex items-center gap-2 font-medium ${statutCouleurs[statutActuel]}`}>
                    <span className={`w-3 h-3 rounded-full ${statutBulle[statutActuel]}`}></span>
                    {statutActuel}
                  </td>
                  <td>{m.prochainCreneau}</td>
                  <td className="px-6 py-4 flex gap-4">
                    <button
                      title="Programmer un rendez-vous"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleViewRDV(m)}
                    >
                      <FaCalendarAlt />
                    </button>
                    <button
                      title="Ouvrir le chat"
                      className="text-green-600 hover:text-green-800"
                      onClick={() => handleOpenChat(m)}
                    >
                      <FaComments />
                    </button>
                    <button
                      title="Démarrer une visio"
                      className="text-purple-600 hover:text-purple-800"
                      onClick={() => handleStartVisio(m)}
                    >
                      <FaVideo />
                    </button>
                  </td>
                </tr>
              );              
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded border ${
                currentPage === page
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
