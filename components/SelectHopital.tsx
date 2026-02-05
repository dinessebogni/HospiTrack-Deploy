'use client';

import React, { useEffect, useState } from "react";

interface Props {
  current: string;
  onChange: (hopital: string) => void;
}

interface Hopital {
  id: string;
  nom: string;
}

export default function SelectHopital({ current, onChange }: Props) {
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHopitaux() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Aucun token trouvé");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/hopitaux", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération des hôpitaux");

        const data: Hopital[] = await res.json();

        setHopitaux(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchHopitaux();
  }, []);

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-sm shadow-sm"
    >
      {loading && <option>Chargement...</option>}
      {error && <option disabled>{error}</option>}
      {!loading && !error && (
        <>
          <option value="">Tous les hôpitaux</option>
          {hopitaux.map((h) => (
            <option key={h.id} value={h.nom}>
              {h.nom}
            </option>
          ))}
        </>
      )}
    </select>
  );
}
