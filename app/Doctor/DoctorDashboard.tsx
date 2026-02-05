'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Navbar from '../../components/Doctor/NavbarMA';
import ActionsRapides from '../../components/Doctor/ActionsRapides';
import SidebarMedecin from '../../components/Doctor/SidebarMedecin';
import { Evenement } from '../../hooks/useEvenements';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Medecin } from '../../hooks/medecin';

export default function DashboardMedecin() {
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const currentDate = format(new Date(), 'd MMMM yyyy', { locale: fr });

  useEffect(() => {
    const token = localStorage.getItem('token')?.trim();
    const medecinId = localStorage.getItem('medecinId')?.trim();
    console.log("Récupération medecinId depuis localStorage:", medecinId);
    
    if (!token || !medecinId) return;

    // --- Récupérer le médecin ---
    fetch(`http://localhost:8000/api/medecins/${medecinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error('Erreur API medecin:', res.status, text);
          throw new Error('Erreur chargement médecin');
        }
        return res.json();
      })
      .then((data) => setMedecin(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!medecin) return;
    const token = localStorage.getItem('token')?.trim();
    if (!token) return;

    // --- Récupérer les événements du médecin ---
    fetch(`http://localhost:8000/api/evenements/${medecin._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erreur chargement événements');
        return res.json();
      })
      .then((data) => setEvenements(data))
      .catch((err) => console.error(err));
  }, [medecin]);

  if (!medecin) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <SidebarMedecin evenements={evenements} />
      <main className="flex-1 p-6">
        <Navbar />
        <div className="mt-6">
          <h1 className="text-2xl md:text-3xl font-bold">Bienvenu, {medecin.nom} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">{currentDate}</p>
        </div>
        <div className="mt-10">
          <ActionsRapides medecinId={medecin._id} />
        </div>
      </main>
    </div>
  );
}
