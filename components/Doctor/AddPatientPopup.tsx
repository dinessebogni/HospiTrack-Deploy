'use client';

import { useState } from 'react';
import type { Patient } from '../../hooks/patient';

interface AddPatientPopupProps {
  onClose: () => void;
  onAdd?: (patient: Patient) => void; // callback pour ajouter le patient à la liste
}

export default function AddPatientPopup({ onClose, onAdd }: AddPatientPopupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      setError('Nom et email sont requis.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:8000/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await res.json();
      console.log('Medecin:', data);
      if (!res.ok) {
        setError(data.message || 'Erreur serveur');
        setLoading(false);
        return;
      }

      if (onAdd) onAdd(data); 
      onClose();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la création du patient.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Ajouter un patient</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nom"
            value={name}
            onChange={e => setName(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Téléphone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {loading ? 'Ajout en cours...' : 'Ajouter'}
          </button>
        </form>
      </div>
    </div>
  );
}
