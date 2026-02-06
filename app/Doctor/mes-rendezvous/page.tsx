'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '../../../components/Doctor/NavbarMA';
import SidebarMedecin from '../../../components/Doctor/SidebarMedecin';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface RendezVous {
  _id: string;
  patient: {
    _id: string;
    name: string;
    email: string;
  };
  start: string;
  end: string;
  status: 'en_attente' | 'confirme' | 'annule';
  reason?: string;
}

interface Medecin {
  _id: string;
  nom: string;
  image?: string;
}

export default function RendezVousPage() {
  const searchParams = useSearchParams();
  const medecinId = searchParams.get('medecinId') || '';

  const [user, setUser] = useState<Medecin | null>(null);
  const [appointments, setAppointments] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupération profil médecin
  useEffect(() => {
    if (!medecinId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:8000/api/medecins/${medecinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error(err));
  }, [medecinId]);

  // Récupération des rendez-vous
  useEffect(() => {
    if (!medecinId) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:8000/api/rendez-vous?medecinId=${medecinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [medecinId]);

  // Fonction pour confirmer ou annuler un rendez-vous
  const handleAction = async (rv: RendezVous, action: 'confirm' | 'cancel') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Update backend
      const res = await fetch(`http://localhost:8000/api/rendez-vous/${rv._id}/${action}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: action === 'confirm' ? 'confirme' : 'annule',
        }),
      });
      if (!res.ok) throw new Error('Erreur mise à jour rendez-vous');

      // Update local state
      setAppointments(prev =>
        prev.map(r => (r._id === rv._id ? { ...r, status: action === 'confirm' ? 'confirme' : 'annule' } : r))
      );

      // Notification côté backend
      await fetch('http://localhost:8000/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: rv.patient._id,
          role: 'patient',
          to: rv.patient.email,
          subject: action === 'confirm' ? 'Rendez-vous confirmé' : 'Rendez-vous annulé',
          text:
            action === 'confirm'
              ? `Votre rendez-vous "${rv._id}" a été confirmé.`
              : `Votre rendez-vous "${rv._id}" a été annulé.`,
          type: action === 'confirm' ? 'confirmation' : 'annulation',
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <SidebarMedecin evenements={[]} />
      <main className="flex-1 p-6">
        <Navbar />
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Rendez-vous reçus</h1>

        {appointments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucun rendez-vous trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-gray-200 dark:bg-gray-700 text-left">
                <tr>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Date / Heure</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(rv => (
                  <tr
                    key={rv._id}
                    className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">{rv.patient.name}</td>
                    <td className="px-6 py-4">{rv.patient.email}</td>
                    <td className="px-6 py-4">
                      {new Date(rv.start).toLocaleString()} - {new Date(rv.end).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 capitalize">{rv.status}</td>
                    <td className="px-6 py-4 flex gap-2">
                      {rv.status === 'en_attente' && (
                        <>
                          <button
                            onClick={() => handleAction(rv, 'confirm')}
                            className="bg-green-600 text-white px-3 py-1 rounded flex items-center justify-center"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleAction(rv, 'cancel')}
                            className="bg-red-600 text-white px-3 py-1 rounded flex items-center justify-center"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
