'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Doctor/Alert';

interface Props {
  hopitalId: string;
  closeModal: () => void;
  defaultNom?: string;
}

export default function MedecinRegisterModal({ hopitalId, closeModal, defaultNom }: Props) {
  const router = useRouter();

  const [nom, setNom] = useState(defaultNom || localStorage.getItem('username') || '');
  const [emailPro, setEmailPro] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [service, setService] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultNom) setNom(defaultNom);
  }, [defaultNom]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Vous devez être connecté.");

      const formData = new FormData();
      formData.append('nom', nom);
      if (emailPro) formData.append('emailPro', emailPro);
      formData.append('specialite', specialite);
      formData.append('service', service);
      formData.append('hopitalId', hopitalId);
      if (image) formData.append('image', image);

      const res = await fetch(`http://localhost:8000/api/medecins`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur lors de l'inscription.");

      if (data.role) localStorage.setItem('role', data.role.toLowerCase());
      if (data.name) localStorage.setItem('name', data.name || nom);
      if (data.statutValidation) localStorage.setItem('statutValidation', data.statutValidation);

      setToastMessage("Inscription réussie ! Patientez la validation de l'admin pour accéder à l'hôpital.");

      if (data.role?.toLowerCase() === 'medecin') {
        if (data.statutValidation === 'valide') router.replace('/AccueilMA');
        else router.replace('/AttenteValidation');
      }
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg p-6 relative text-gray-900 dark:text-gray-100">
          <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold">&times;</button>

          <h2 className="text-2xl font-bold mb-4">Inscription médecin</h2>

          {error && <div className="bg-red-100 dark:bg-red-600 text-red-700 dark:text-white p-2 rounded mb-2">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Nom */}
            <div>
              <label className="block mb-1 font-medium">Nom *</label>
              <input 
                type="text" 
                value={nom} 
                onChange={(e) => setNom(e.target.value)} 
                required
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email Pro */}
            <div>
              <label className="block mb-1 font-medium">Email professionnel</label>
              <input 
                type="email" 
                value={emailPro} 
                onChange={(e) => setEmailPro(e.target.value)} 
                placeholder="ex: nom@hopital.com"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Spécialité */}
            <div>
              <label className="block mb-1 font-medium">Spécialité *</label>
              <input 
                type="text" 
                value={specialite} 
                onChange={(e) => setSpecialite(e.target.value)} 
                required
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Service */}
            <div>
              <label className="block mb-1 font-medium">Service *</label>
              <input 
                type="text" 
                value={service} 
                onChange={(e) => setService(e.target.value)} 
                required
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block mb-1 font-medium">Image / Photo</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="w-full text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              disabled={loading} 
              className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
            >
              {loading ? "Inscription..." : "S'inscrire"}
            </button>
          </form>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} show={!!toastMessage} onClose={() => setToastMessage(null)} type="success" />
      )}
    </>
  );
}
