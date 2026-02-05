'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface ProfilEditFormProps {
  nomInitial: string;
  emailInitial: string;
  avatarInitial: string;
  onCancel: () => void;
  onSave: (data: { name: string; email: string; avatar: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export default function ProfilEditForm({
  nomInitial,
  emailInitial,
  avatarInitial,
  onCancel,
  onSave,
  loading,
  error,
}: ProfilEditFormProps) {
  const [nom, setNom] = useState(nomInitial);
  const [email, setEmail] = useState(emailInitial);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(avatarInitial || '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let avatarUrl = avatarPreview;

    if (avatarFile) {
      // upload vers API
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.error('Erreur upload avatar');
        return;
      }

      const data = await res.json();
      avatarUrl = data.url; // URL retournée par l’API
    }

    await onSave({ name: nom, email, avatar: avatarUrl });
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <form
        className="bg-white dark:bg-gray-800 p-6 rounded-lg w-80 relative"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute top-3 right-3 text-gray-700 dark:text-gray-300 hover:text-gray-900"
          onClick={onCancel}
          aria-label="Fermer"
        >
          ✕
        </button>

        <label className="block mb-2 font-semibold" htmlFor="nom">
          Nom
        </label>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
          required
        />

        <label className="block mb-2 font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-white"
          required
        />

        <label className="block mb-2 font-semibold" htmlFor="avatar">
          Photo Profil
        </label>

        {/* Aperçu */}
        {avatarPreview && (
          <Image
            src={avatarPreview}
            alt="Aperçu avatar"
            width={96}
            height={96}
            className="rounded-full object-cover mx-auto mb-4"
          />
        )}

        {/* Input fichier */}
        <input
          id="avatar"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded mb-2 dark:bg-gray-700 dark:text-white"
        />

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="mt-6 flex justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
