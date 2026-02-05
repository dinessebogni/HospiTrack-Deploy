"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Rdv = {
  date: string;
  debut: string;
  fin: string;
  patient?: string;
};

type Medecin = {
  nom: string;
  specialite: string;
  email: string;
  telephone: string;
  photoUrl?: string;
  agenda: Rdv[];
};

export default function MedecinDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMedecin() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/medecins/${id}`);
        if (!res.ok) throw new Error("Erreur lors de la récupération du médecin");
        const data: Medecin = await res.json();
        setMedecin(data);
      } catch (err: any) {
        setError(err.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchMedecin();
  }, [id]);

  if (loading) return <p className="p-6">Chargement...</p>;
  if (error) return <p className="p-6 text-red-600">Erreur: {error}</p>;
  if (!medecin) return <p className="p-6">Médecin introuvable</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <div className="flex items-center space-x-6">
        {medecin.photoUrl && (
          <img
            src={medecin.photoUrl}
            alt={`Photo de Dr. ${medecin.nom}`}
            className="w-24 h-24 rounded-full object-cover border border-gray-300"
          />
        )}
        <h1 className="text-3xl font-bold">Dr. {medecin.nom}</h1>
      </div>

      <p><strong>Spécialité :</strong> {medecin.specialite}</p>
      <p><strong>Email :</strong> {medecin.email}</p>
      <p><strong>Téléphone :</strong> {medecin.telephone}</p>

      <section>
        <h2 className="text-xl font-semibold mb-2">Disponibilités (Agenda)</h2>
        {medecin.agenda.length === 0 ? (
          <p>Pas de rendez-vous planifiés.</p>
        ) : (
          <ul className="list-disc pl-5 space-y-1 max-h-64 overflow-auto">
            {medecin.agenda.map((rdv, index) => (
              <li key={index}>
                <strong>Date :</strong> {rdv.date} | <strong>Heure :</strong> {rdv.debut} - {rdv.fin}
                {rdv.patient && <> | <em>Patient : {rdv.patient}</em></>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pt-4 border-t">
        <Link
          href={`/visio/${id}`} // page interne qui affichera la visio
          className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow"
        >
          📞 Lancer l'appel
        </Link>
      </section>
    </div>
  );
}
