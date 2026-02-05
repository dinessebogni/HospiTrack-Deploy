'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Navbar from '../../components/Doctor/NavbarMA';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import PlanningJour from '../../components/Doctor/PlanningJour';
import { Evenement } from '../../hooks/useEvenements';

interface Medecin {
  id: string;
  nom: string;
  avatar: string;
}

export default function Dashboard() {
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [evenements, setEvenements] = useState<Evenement[]>([]);

  const currentDate = format(new Date(), 'd MMMM yyyy', { locale: fr });

  useEffect(() => {
    const storedMedecin = localStorage.getItem('medecinConnecte');
    if (storedMedecin) {
      setMedecin(JSON.parse(storedMedecin));
    } else {
      console.warn('Aucun médecin connecté trouvé.');
    }

    const storedEvents = localStorage.getItem('evenements');
    if (storedEvents) {
      try {
        const parsed = JSON.parse(storedEvents);
        setEvenements(parsed);
      } catch (error) {
        console.error('Erreur parsing événements :', error);
      }
    }
  }, []);

  if (!medecin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700 dark:text-gray-300">
        Chargement du profil médecin...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar médecin */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4">
        <div className="text-center mb-6">
          <Image
            src={medecin.avatar}
            alt={medecin.nom}
            width={80}
            height={80}
            className="rounded-full mx-auto"
          />
          <p className="mt-2 font-semibold">{medecin.nom}</p>

          {/* Planning du jour */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Planning de la journée</h2>
            <PlanningJour medecinId={medecin.id} evenements={evenements} />
            <Link href="/Doctor/agenda">
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                Voir mon agenda complet
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 p-6">
        <Navbar />

        <div className="mt-6">
          <h1 className="text-2xl md:text-3xl font-bold">
            Bonjour, {medecin.nom} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{currentDate}</p>
        </div>
      </main>
    </div>
  );
}
