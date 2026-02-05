'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SidebarMedecin from '../../../../components/Doctor/SidebarMedecin';
import Navbar from '../../../../components/Doctor/NavbarMA';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import Image from 'next/image';

type Patient = {
  _id: string;
  nom: string;
  email: string;
  image?: string;
};

export default function PrendreRDVMedecin() {
  const { id } = useParams();
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data); 
      })
      .catch(() => setError("Impossible de charger les informations du médecin."));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !heure) {
      setError('Veuillez choisir une date et une heure.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const start = new Date(`${date}T${heure}`);
      const end = new Date(start.getTime() + 30 * 60000); // 30 minutes

      const res = await fetch('http://localhost:8000/api/rendez-vous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Consultation avec ${patient?.nom}`,
          start: start.toISOString(),
          end: end.toISOString(),
          patientId: patient?._id,
          medecinId: currentUser?.medecinId,
        }),
      });
      console.log("Données reçues:", res.body);
// console.log("Utilisateur connecté:", res.user);


      if (!res.ok) throw new Error('Erreur lors de la création du rendez-vous');

      setSuccess('Rendez-vous programmé avec succès !');
      setTimeout(() => setSuccess(null), 2000);
      setDate('');
      setHeure('');

      // Envoi notification au patient
      await fetch('http://localhost:8000/api/notifications/send', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: 'patient',
          type: 'nouveau_rdv',
          email: patient?.email,
          userId: patient?._id,
          customMessage: `Le médecin ${currentUser?.name} a programmé un rendez-vous avec vous le ${start.toLocaleString()}.`,
          eventName: `Consultation`,
          eventDate: start.toISOString(),
        }),
      });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <SidebarMedecin evenements={[]} />
      <main className="flex-1 p-6">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {success && <p className="text-white bg-green-600 p-2 rounded mb-4 text-center">{success}</p>}
          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

          {patient ? (
            <div className="flex flex-col md:flex-row items-start">
              {/* Form */}
              <div className="md:w-2/3 bg-white dark:bg-gray-800 rounded shadow p-6">
                <div className="flex items-center gap-4 mb-4">
                  {/* <Image
                    src={patient.image ? `http://localhost:8000${patient.image}` : '/images/avatar-patient.png'}
                    alt={patient.nom}
                    width={150}
                    height={150}
                    className="rounded-full object-cover border-2 border-green-600"
                  /> */}
                  <div>
                    <h1 className="text-2xl font-bold">Créer un rendez-vous avec {patient.nom}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{patient.email}</p>
                  </div>
                </div>

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
                      className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    {loading ? 'Création...' : 'Programmer le rendez-vous'}
                  </button>
                </form>
              </div>

              {/* Illustration */}
              <div className="md:w-[80%] flex items-start justify-center ml-4 mt-6 md:mt-0">
                <Image
                  src="/images/rdv-img.png"
                  alt="Illustration rendez-vous"
                  width={1400}
                  height={1400}
                  className="w-full max-w-[900px] h-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <LoadingSpinner />
          )}
        </div>
      </main>
    </div>
  );
}
