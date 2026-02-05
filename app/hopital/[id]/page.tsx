'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Navbar from '../../../components/Patient/Navbar';
import SelectSpecialite from '../../../components/SelectSpecialite';
import SelectService from '../../../components/SelectService';
import MedecinRegisterModal from '../../../components/Doctor/CreateMedecinFrom';

interface Hopital { _id: string; nom: string; ville: string; }

interface Medecin {
  _id: string;
  nom: string;
  specialite: string;
  service: string;
  hopitalId: string;
  image: string;
  statut: 'Disponible' | 'Occupé';
  statutValidation: 'valide' | 'en_attente' | 'refusé';
}

export default function HopitalPage() {
  const params = useParams();
  const hopitalId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [hopital, setHopital] = useState<Hopital | null>(null);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [filteredMedecins, setFilteredMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchName, setSearchName] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [selectedService, setSelectedService] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);

  // Récupérer l'hôpital et ses médecins validés
  useEffect(() => {
    async function fetchHopital() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/hopitaux/${hopitalId}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Erreur API');
        const data = await res.json();

        setHopital(data.hopital);

        const valides = data.medecins.filter((m: Medecin) => m.statutValidation === 'valide');
        setMedecins(valides);
        setFilteredMedecins(valides);
      } catch {
        setHopital(null);
        setMedecins([]);
        setFilteredMedecins([]);
      } finally {
        setLoading(false);
      }
    }
    if (hopitalId) fetchHopital();
  }, [hopitalId]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...medecins];
    if (searchName.trim() !== '') {
      filtered = filtered.filter((m) => m.nom.toLowerCase().includes(searchName.toLowerCase()));
    }
    if (selectedSpecialite.trim() !== '') {
      filtered = filtered.filter((m) => m.specialite === selectedSpecialite);
    }
    if (selectedService.trim() !== '') {
      filtered = filtered.filter((m) => m.service === selectedService);
    }
    setFilteredMedecins(filtered);
  }, [searchName, selectedSpecialite, selectedService, medecins]);

  if (loading) return <LoadingSpinner />;

  if (!hopital) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-2xl">❌</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
              Aucun médecin validé pour cet hôpital
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Revenez plus tard.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 flex flex-col items-center py-12 px-4"> {/* Entête avec phrase d'accroche + bouton s'inscrire */} 
        <section className="relative w-full max-w-6xl mx-auto bg-green-50 dark:bg-gray-800 rounded-2xl p-12 mb-12 text-center shadow-xl space-y-6"> 
          <div className="mb-4"> 
            <svg className="w-16 h-16 mx-auto text-green-500 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" > 
              <path d="M19 21V7a2 2 0 0 0-2-2h-3V3h-4v2H7a2 2 0 0 0-2 2v14H2v2h20v-2h-3zM9 11h2v2H9v-2zm0 4h2v2H9v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2zm4-4h2v2h-2v-2zm0 4h2v2h-2v-2z"/> 
            </svg> 
          </div> 
          <h1 className="text-3xl sm:text-4xl font-bold leading-snug text-gray-800 dark:text-gray-100"> Vous êtes un médecin de <br /> {hopital.nom} ? </h1> 
          <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg"> Inscrivez-vous pour rejoindre l'équipe médicale de cet hôpital et gérer vos disponibilités. </p> 
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition transform hover:-translate-y-1"
          >
            S'inscrire
          </button>
        </section>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-6xl mb-6 justify-center">
          <input
            type="text"
            placeholder="Rechercher par nom..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full px-10 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm text-sm text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <SelectSpecialite
            current={selectedSpecialite}
            onChange={(val) => setSelectedSpecialite(val)}
          />
          <SelectService
            current={selectedService}
            onChange={(val) => setSelectedService(val)}
          />
        </div>

        {/* Liste des médecins */}
        <section className="w-full max-w-6xl mx-auto p-8 mb-12 transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
            Médecins de {hopital.nom}
          </h2>
          {filteredMedecins.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {filteredMedecins.map((m) => (
                <div key={m._id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5">
                  <img
                    src={`http://localhost:8000${m.image}`}
                    alt={m.nom}
                    className="w-full h-36 sm:h-40 md:h-44 object-cover"
                  />
                  <div className="p-3 space-y-1">
                    <p className="text-lg font-bold text-gray-800 dark:text-white">{m.nom}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{m.specialite}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{m.service}</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${m.statut === 'Disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {m.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Aucun médecin validé trouvé avec ces critères.
            </div>
          )}
        </section>

        {/* Modal création médecin */}
        {showModal && (
          <MedecinRegisterModal
            hopitalId={hopitalId}
            closeModal={() => setShowModal(false)}
          />
        )}

      </main>
    </>
  );
}
