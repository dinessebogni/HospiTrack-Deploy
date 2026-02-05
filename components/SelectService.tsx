'use client';

import React, { useEffect, useState } from "react";

interface Props {
  current: string;
  onChange: (service: string) => void;
}

interface Medecin {
  service: string;
}

export default function SelectService({ current, onChange }: Props) {
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Aucun token trouvé");
          setLoading(false);
          return;
        }

        const res = await fetch("http://localhost:8000/api/medecins", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération des services");

        const data: Medecin[] = await res.json();

        // Récupère toutes les valeurs de service et garde uniquement les uniques
        const unique: string[] = Array.from(new Set(data.map((m) => m.service)));
        setServices(unique);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
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
          <option value="">Tous les services</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </>
      )}
    </select>
  );
}
