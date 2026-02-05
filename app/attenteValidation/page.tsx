'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AttenteValidationPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Votre compte est en attente de validation...");

  useEffect(() => {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId'); 
    const token = localStorage.getItem('token');

    if (!role || role.toLowerCase() !== 'medecin') {
      router.replace('/');
      return;
    }

    // Fonction qui vérifie le statut du médecin
    const checkValidation = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/medecins/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.ok && data.statut === 'valide') {
          // Sauvegarde en local et redirection
          localStorage.setItem('statutValidation', 'valide');
          router.replace('/AccueilMA');
        } else {
          setMessage("Votre compte est encore en attente de validation par l'admin...");
        }
      } catch (err) {
        console.error("Erreur vérification statut:", err);
      }
    };

    // Vérifie immédiatement
    checkValidation();

    // Vérifie toutes les 10 secondes
    const interval = setInterval(checkValidation, 10000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Compte en attente</h1>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}
