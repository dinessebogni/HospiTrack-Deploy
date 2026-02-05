"use client";
import { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import Image from "next/image";

type NavbarProps = {
  onMenuClick: () => void;
};

type HopitalData = {
  hopital: {
    _id: string;
    nom: string;
    image?: string;
  };
};

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const [hopitalData, setHopitalData] = useState<HopitalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const hopitalId = localStorage.getItem("hopitalId");

    if (!token || !hopitalId) {
      setLoading(false);
      return;
    }

    async function fetchHopital() {
      try {
        const res = await fetch(`http://localhost:8000/api/hopitaux/${hopitalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Impossible de récupérer l'hôpital");
        const data = await res.json();
        setHopitalData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHopital();
  }, []);

  const hopital = hopitalData?.hopital;

  const imageUrl = hopital?.image
    ? `http://localhost:8000/uploads/${hopital.image}`
    : "/asset/hospital.png";

  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      {/* Burger menu (mobile only) */}
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <Menu size={24} />
      </button>

      <h2 className="text-lg font-semibold hidden md:block">Dashboard</h2>

      <div className="flex items-center space-x-4">
        <Bell className="text-gray-600" />
        <div className="flex items-center space-x-2">
          {!loading && hopital && (
            <Image
              src={imageUrl}
              alt={hopital.nom}
              width={50}
              height={50}
              className="rounded-full"
            />
          )}
          <span className="font-medium"> Hôpital {hopital?.nom || "Admin"}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
