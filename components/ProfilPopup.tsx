'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ProfilPopupProps {
  nom?: string;
  email?: string;
  avatar?: string;
  onClose: () => void;
  onEdit: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function ProfilPopup({
  nom,
  email,
  avatar,
  onClose,
  onEdit,
  loading,
  error,
}: ProfilPopupProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Vider le localStorage et sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // Fermer le popup
    onClose();

    // Redirection vers la page de login
    router.push('/');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-700 dark:text-gray-300 hover:text-gray-900"
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>

        {loading ? (
          <p className="text-center">Chargement...</p>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : (
          <>
            {avatar && (
              <img
                src={avatar}
                alt={nom}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            )}
            <h2 className="mt-4 text-xl font-semibold text-center">{nom || 'Utilisateur'}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-center">{email}</p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={onEdit}
              >
                Modifier
              </button>

              <button
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={onClose}
              >
                Fermer
              </button>

              <button
                className="w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
                onClick={handleLogout}
              >
                Déconnexion
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
