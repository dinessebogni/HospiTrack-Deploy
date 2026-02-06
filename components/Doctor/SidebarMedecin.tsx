'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PlanningJournee from '../Doctor/PlanningJour';

import { Evenement } from '../../hooks/useEvenements';

interface Medecin {
  _id: string;
  nom: string;
  image?: string;
}

interface SidebarProps {
  evenements?: Evenement[];
}

export default function SidebarMedecin({ evenements = [] }: SidebarProps) {
  const router = useRouter();
  const [medecin, setMedecin] = useState<Medecin | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchMedecin = async () => {
      try {
        const token = localStorage.getItem('token');
        const medecinId = localStorage.getItem('medecinId'); 
        if (!token || !medecinId) return;

        const res = await fetch(`http://localhost:8000/api/medecins/${medecinId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur récupération médecin");

        const data: Medecin = await res.json();
        setMedecin(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMedecin();
  }, []);

  if (!medecin) return <p>Chargement...</p>;

  const avatarSrc = medecin.image
    ? `http://localhost:8000${medecin.image.startsWith('/') ? '' : '/'}${medecin.image}`
    : '/default-avatar.png';

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col gap-8 shadow-lg">
      {/* Photo + Nom */}
      <div className="flex flex-col items-center">
        <Image
          src={avatarSrc}
          alt={`${medecin.nom} avatar`}
          width={100}
          height={100}
          className="rounded-full object-cover"
        />
        <h2 className="mt-4 font-semibold text-lg text-gray-900 dark:text-white">
          {medecin.nom}
        </h2>
      </div>

      {/* Planning du jour */}
      <div>
        <PlanningJournee medecinId={medecin._id} evenements={evenements} />

        {/* Bouton redirection vers agenda avec medecin._id */}
        <button
          onClick={() => router.push(`/Doctor/agenda/${medecin._id}`)}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          Ajouter un événement
        </button>
      </div>
    </aside>
  );
}
