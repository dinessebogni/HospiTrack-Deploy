'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Navbar from '../../../../components/Patient/Navbar';
import Image from 'next/image';

type Medecin = {
  _id: string;
  nom: string;
  email: string;
  specialite: string;
  service: string;
  hopitalId: string;
  image?: string;
};

type Patient = {
  _id: string;
  nom: string;
  email: string;
  image?: string;
};

export default function PrendreRendezVous() {
  const router = useRouter();
  const { id } = useParams(); 
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedecin() {
      if (!id) {
        setError('Médecin non défini');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/medecins/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data = await res.json();
        setMedecin(data);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
      }
    }
    fetchMedecin();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:8000/api/profile/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        console.log('Données récupérées depuis /api/profile:', data); 
        setPatient(data);
      })
      .catch(() => setError("Impossible de charger les informations."));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !heure) {
      setError('Veuillez sélectionner une date et une heure.');
      return;
    }
   
    setLoading(true);
    setError(null);
  
    try {
      const token = localStorage.getItem('token');
      const start = new Date(`${date}T${heure}`);
      const end = new Date(start.getTime() + 30 * 60000);
  
      // Création du rendez-vous
      const res = await fetch('http://localhost:8000/api/rendez-vous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Rendez-vous avec ${medecin?.nom}`,
          start: start.toISOString(),
          end: end.toISOString(),
          medecinId: medecin?._id,
          hopitalId: medecin?.hopitalId,
        }),
      });
  
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const rendezVous = await res.json();
  
      setSuccess('Rendez-vous créé avec succès !');
      setTimeout(() => setSuccess(null), 2000);
  
      // Envoi de la notification au médecin
      await fetch('http://localhost:8000/api/notifications/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'medecin',
          type: 'nouvelle_demande',         
          email: medecin?.email,            
          // phone: medecin?.phone || '',       
          userId: medecin?._id,
          customMessage: `Vous avez une nouvelle demande de rendez-vous de la part de ${setPatient?.name} le ${start.toLocaleString()}.`,
          eventName: `Rendez-vous avec ${medecin?.nom}`,
          eventDate: start.toISOString(),
        }),
      });
  
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du rendez-vous');
    } finally {
      setLoading(false);
    }
  };

  if (!id) return <p className="text-center mt-4 text-red-600">Médecin non défini</p>;
  if (error) return <p className="text-red-600 text-center mt-4">{error}</p>;
  if (!medecin) return <LoadingSpinner />;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {success && <p className="text-white bg-green-600 p-2 rounded mb-4 text-center">{success}</p>}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="flex flex-col md:flex-row items-start max-w-4xl mx-auto px-4 py-8">
          {/* Formulaire dans le card avec shadow */}
          <div className="md:w-2/3 bg-white dark:bg-gray-800 rounded shadow p-6">
            {/* En-tête avec image du médecin */}
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={medecin.image ? `http://localhost:8000${medecin.image}` : "/images/medecin-placeholder.jpg"} 
                alt={medecin.nom}
                width={150} 
                height={150}
                className="rounded-full object-cover border-2 border-green-600"
              />
              <h1 className="text-2xl font-bold">Prendre rendez-vous avec {medecin.nom}</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{medecin.specialite}</p>
        
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Date :</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label>Heure :</label>
                <input
                  type="time"
                  value={heure}
                  onChange={(e) => setHeure(e.target.value)}
                  className="w-full px-3 py-2 border rounded  dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                {loading ? 'Création...' : 'Prendre rendez-vous'}
              </button>
            </form>
          </div>
        
          <div className="md:w-[80%] flex items-start justify-center ml-4 mt-6 md:mt-0">
            <Image
              src="/images/rdv-img.png"
              alt="Illustration médecin"
              width={1400}
              height={1400}
              className="w-full max-w-[900px] h-auto object-contain"
            />
          </div>

          </div>
        )}
      </main>
    </>
  );
}
