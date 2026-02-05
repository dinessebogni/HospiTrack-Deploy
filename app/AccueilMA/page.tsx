"use client";

import { useEffect, useState } from "react";
import HeroSection from "../../components/HeroSection";
import FeaturesList from "../../components/FeaturesList";
import ImageSection from "../../components/ImageSection";
import { useRouter } from "next/navigation";

export default function Home() {
  const [role, setRole] = useState<string | null>(null);
  const [medecinId, setMedecinId] = useState<string | null>(null);
  const [hopitalId, setHopitalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Récupérer l'utilisateur courant depuis localStorage
    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);

      console.log(
        "Utilisateur chargé depuis localStorage:",
        `role: ${user.role} | medecinId: ${user.medecinId} | hopitalId: ${user.hopitalId}`
      );

      setRole(user.role || null);
      setMedecinId(user.medecinId || null);
      setHopitalId(user.hopitalId || null);
    }

    setLoading(false);
  }, []);

  const getTargetPath = () => {
    if (!role) return "/SessionLogin";

    switch (role) {
      case "admin-hopital":
        return hopitalId ? "/Admin" : "/SessionLogin";
      case "medecin":
        return medecinId ? "/Doctor" : "/SessionLogin";
      case "patient":
        return "/Patient";
      default:
        return "/SessionLogin";
    }
  };

  const handleCommencerClick = () => {
    router.push(getTargetPath());
  };

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-gray-900">Hospi Track</h1>
        <div className="space-x-4">
          <a href="/SessionLogin" className="text-sm font-medium hover:underline">
            Se connecter
          </a>
          <a href="/SessionSignup" className="text-sm font-medium hover:underline">
            S&apos;inscrire
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <HeroSection />
            <FeaturesList />

            {!loading && (
              <button
                onClick={handleCommencerClick}
                className="mt-10 px-8 py-4 text-lg bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
              >
                Commencer
              </button>
            )}
          </div>
          <ImageSection />
        </div>
      </main>
    </div>
  );
}
