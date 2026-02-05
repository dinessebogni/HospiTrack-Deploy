'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../../components/Doctor/NavbarMA';
import SidebarMedecin from '../../../components/Doctor/SidebarMedecin';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import type { Medecin } from '../../../hooks/medecin';
import type { Patient } from '../../../hooks/patient';
import AddPatientPopup from '../../../components/Doctor/AddPatientPopup';
import { FaCalendarAlt, FaComments, FaVideo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function MesPatients() {
  const [user, setUser] = useState<Medecin | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const router = useRouter();

  const handleViewRDV = (patient: Patient) => { 
    // Redirection vers la page des rendez-vous pour ce patient
    console.log("prendre rendez-vous pour :", patient);
    router.push(`/Doctor/rendez-vous/${patient._id}`);
  };
  
    // Ouvre le room entre un médecin et un patient
  const handleOpenChat = (patient: Patient) => {
    console.log("Ouvrir chat avec :", patient);
    router.push(`/Doctor/chat/${patient._id}`); 
  };
  
    // Ouvrir lien Jitsi
  const handleStartVisio = async (patient: Patient) => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('Pas de token');
    if (!user?._id) return console.error('ID médecin manquant');
  
    const payload = {
      patientId: patient._id,
      medecinId: user._id,
    };
  
    try {
      const res = await fetch('http://localhost:8000/api/visio/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur création visio');
  
      console.log('Visio créée:', data);
  
      // Rediriger vers la page de visio avec le roomName
      router.push(`/Doctor/visio/${data.roomName}`);
    } catch (err: any) {
      console.error('Erreur démarrage visio :', err);
      alert(err.message);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    fetch('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data?._id) throw new Error('ID utilisateur manquant');
  
        setUser({
          _id: data._id,
          nom: data.nom,
          image: data.image || '',
          service: data.service || '',
          specialite: data.specialite || '',
          hopital: data.hopital || '',
          dateInscription: data.dateInscription || '',
        });
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    setLoading(true);
    fetch("http://localhost:8000/api/medecins/mes-patients", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: Patient[]) => {
        setPatients(data);
        setFilteredPatients(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredPatients(patients);
    } else {
      const term = search.toLowerCase();
      setFilteredPatients(
        patients.filter(
          p =>
            p.name.toLowerCase().includes(term) ||
            p.email.toLowerCase().includes(term)
        )
      );
    }
  }, [search, patients]);

  if (!user || loading) return <LoadingSpinner />;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <SidebarMedecin evenements={[]} />
      <main className="flex-1 p-6">
        <Navbar />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Mes patients</h1>
          <button
            onClick={() => setIsPopupOpen(true)}
            className="flex items-center gap-2 px-4 py-2 my-8 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaPlus /> Ajouter un patient
          </button>
        </div>

        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4 w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {filteredPatients.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucun patient trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-gray-200 dark:bg-gray-700 text-left">
                <tr>
                  <th className="px-6 py-3">Nom</th>
                  <th className="px-6 py-3">Email</th>
                  {/* <th className="px-6 py-3">Téléphone</th> */}
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">{patient.name}</td>
                    <td className="px-6 py-4">{patient.email}</td>
                    {/* <td className="px-6 py-4">{patient.phone || '-'}</td> */}
                    <td className="px-6 py-4 flex gap-4">
                      <button
                        title="programmer un rendez-vous"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleViewRDV(patient)}
                      >
                        <FaCalendarAlt />
                      </button>
                      <button
                        title="Ouvrir le chat"
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleOpenChat(patient)}
                      >
                        <FaComments />
                      </button>
                      <button
                        title="Démarrer une visio"
                        className="text-purple-600 hover:text-purple-800"
                        onClick={() => handleStartVisio(patient)}
                      >
                        <FaVideo />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isPopupOpen && <AddPatientPopup onClose={() => setIsPopupOpen(false)} />}
      </main>
    </div>
  );
}
