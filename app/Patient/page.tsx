'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Hospicard from '../../components/HopitalCard';
import Navbar from '../../components/Patient/Navbar';
import SelectVille from '../../components/SellectVille';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FiSearch } from 'react-icons/fi';

type Hopital = {
  _id: string;     
  nom: string;
  ville: string;
  image?: string;    
};

export default function AccueilPatient() {
  const [ville, setVille] = useState('');
  const [recherche, setRecherche] = useState('');
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHopitaux() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        console.log('Token:', token);
        const res = await fetch("http://localhost:8000/api/hopitaux", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error(`Erreur ${res.status} : ${res.statusText}`);
        const data = await res.json();
        console.log('Hopitaux API:', data);
        setHopitaux(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchHopitaux();
  }, []);

  const hopitauxFiltres = hopitaux.filter(h =>
    (!ville || h.ville.toLowerCase() === ville.toLowerCase()) &&
    (!recherche || h.nom.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <>
      <Navbar />
      <main className="dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-6xl space-y-16">

          {/* Hero / Accroche */}
          <section className="relative w-full bg-green-50 dark:bg-gray-800 rounded-xl p-8 mb-12 text-center shadow-md space-y-6">
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto text-green-500 dark:text-green-400"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19 21V7a2 2 0 0 0-2-2h-3V3h-4v2H7a2 2 0 0 0-2 2v14H2v2h20v-2h-3zM9 11h2v2H9v-2zm0 4h2v2H9v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
              </svg>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold leading-snug text-gray-800 dark:text-gray-100">
              Bienvenue sur la plateforme de <br /> téléconsultation dédiée aux hôpitaux
            </h1>

            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg">
              Vous avez un hôpital ? Ajoutez-le en ligne pour rendre vos services médicaux visibles en temps réel et faciliter la prise de rendez-vous pour vos patients.
            </p> <br />

            <Link href="/Admin/add-hopital">
              <button className="px-8 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition transform hover:-translate-y-1">
                Créer mon hôpital
              </button>
            </Link>
          </section>

          {/* Filtres de recherche */}
          <section className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <SelectVille current={ville} onChange={setVille} hopitaux={hopitaux} />
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-xs">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <FiSearch className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un hôpital..."
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="w-full px-10 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </section>

          {/* Chargement et erreurs */}
          {loading && <div className="flex justify-center"><LoadingSpinner /></div>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {/* Cartes d'hôpitaux */}
          {!loading && !error && (
            <section>
              {hopitauxFiltres.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                  {hopitauxFiltres.map((h) => (
                    <Hospicard
                      key={h._id}
                      id={h._id}
                      nom={h.nom}
                      ville={h.ville}
                      image={h.image}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center">Aucun hôpital trouvé pour cette recherche.</p>
              )}
            </section>
          )}

          {/* Voir plus */}
          <section className="w-full flex justify-center">
            <Link href="/all-hopital">
              <button className="px-6 py-3 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                Voir plus d'hôpitaux
              </button>
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
