"use client";

import { useState, useEffect } from "react";
import Hospicard from "../../components/HopitalCard";
import SelectVille from "../../components/SellectVille";
import Navbar from "../../components/Patient/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";

type Hopital = {
  _id: string;
  nom: string;
  ville: string;
  image: string;
};

export default function AllHospitalsPage() {
  const [ville, setVille] = useState("");
  const [hopitaux, setHopitaux] = useState<Hopital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHopitaux = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token"); 
      if (!token) throw new Error("Utilisateur non authentifié");

      const res = await fetch("http://localhost:8000/api/hopitaux", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });

      if (res.status === 401) throw new Error("Non autorisé. Veuillez vous connecter.");
      if (!res.ok) throw new Error("Erreur lors du chargement des hôpitaux");

      const data: Hopital[] = await res.json();
      console.log("hospitaux enregistré :", data);
      setHopitaux(data);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHopitaux();
  }, []);

  // Filtrer par ville 
  const hopitauxFiltres = ville
    ? hopitaux.filter((h) => h.ville.toLowerCase() === ville.toLowerCase())
    : hopitaux;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-10">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Tous les Hôpitaux</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Recherchez un hôpital par ville ou explorez la liste complète.
          </p>
        </div>

        <div className="flex justify-center">
          <SelectVille current={ville} onChange={setVille} hopitaux={hopitaux} />
        </div>

        {loading && (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-600">
            <p>Erreur : {error}</p>
            <button
              onClick={fetchHopitaux}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && hopitauxFiltres.length === 0 && (
          <p className="text-center">Aucun hôpital trouvé pour cette ville.</p>
        )}

        {!loading && !error && hopitauxFiltres.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hopitauxFiltres.map((h) => (
              <Hospicard
                key={h._id}  
                id={h._id}  
                nom={h.nom}
                ville={h.ville}
                image={h.image}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
