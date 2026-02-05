'use client';

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function CreateHopitalPage() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [ville, setVille] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [accreditation, setAccreditation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const placeholderImg = "/asset/hospital.png";

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImage(file);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Vous devez être connecté pour créer un hôpital.");

      const formData = new FormData();
      formData.append("nom", nom);
      formData.append("ville", ville);
      formData.append("telephone", telephone);
      formData.append("email", email);
      formData.append("accreditation", accreditation);
      if (image) formData.append("image", image);

      const res = await fetch("http://localhost:8000/api/hopitaux", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Erreur lors de la création.");

      if(result.token){
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role);
        localStorage.setItem("name", result.name);
        if(result.hopital?._id) localStorage.setItem("hopitalId", result.hopital._id);
        if(result.role === 'admin-hopital') router.replace('/AccueilMA');
      }

      setSuccess("Hôpital créé avec succès !");
      setNom(""); setVille(""); setEmail(""); setTelephone(""); setAccreditation(""); setImage(null);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow-md flex flex-col md:flex-row gap-8 mt-12 text-gray-900 dark:text-gray-100">
      
      {/* Formulaire */}
      <form className="flex-1 space-y-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-semibold mb-4">Créer mon hôpital</h2>

        {error && <div className="bg-red-100 dark:bg-red-600 text-red-700 dark:text-white p-2 rounded mb-2">{error}</div>}
        {success && <div className="bg-green-100 dark:bg-green-600 text-green-700 dark:text-white p-2 rounded mb-2">{success}</div>}

        <div>
          <label htmlFor="nom" className="block mb-1 font-medium">Nom *</label>
          <input
            id="nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            placeholder="Nom de l'hôpital"
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="ville" className="block mb-1 font-medium">Ville *</label>
          <input
            id="ville"
            type="text"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            required
            placeholder="Ville"
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@hopital.com"
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="telephone" className="block mb-1 font-medium">Téléphone</label>
          <input
            id="telephone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+237 6 70 00 00 00"
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="accreditation" className="block mb-1 font-medium">Numéro d’accréditation / licence *</label>
          <input
            id="accreditation"
            type="text"
            value={accreditation}
            onChange={(e) => setAccreditation(e.target.value)}
            required
            placeholder="Ex: ACCR-123456"
            disabled={loading}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label htmlFor="image" className="block mb-1 font-medium">Image / Logo</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="w-full text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Création..." : "Créer l’hôpital"}
        </button>
      </form>

      {/* Aperçu de l'image */}
      <div className="flex-1 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded p-4 min-h-[200px] bg-gray-50 dark:bg-gray-800">
        <img
          src={image ? URL.createObjectURL(image) : placeholderImg}
          alt="Aperçu de l'image de votre hôpital"
          className="object-contain rounded w-[300px] h-[180px]"
        />
      </div>
    </div>
  );
}
