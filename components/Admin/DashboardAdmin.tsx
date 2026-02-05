"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import StatCard from "./StatsCard";
import ChartLine from "./LineChart";
import BarChart from "./Barchart";
import MedecinPendingTable from "./MedecinList";
import { Medecin } from "../../hooks/medecin";
import Todo from "./Todo";
import LoadingSpinner from "../LoadingSpinner";
import { FaUser, FaUserMd, FaCalendarCheck, FaHourglassHalf } from "react-icons/fa";

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  pendingAppointments: number;
  appointments: any[];
}

export default function DashboardAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalDoctors: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    appointments: [],
  });

  const [pendingMedecins, setPendingMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);
  const [hopitalId, setHopitalId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Accéder à localStorage côté client
  useEffect(() => {
    const storedHopitalId = localStorage.getItem("hopitalId");
    const storedToken = localStorage.getItem("token");
    setHopitalId(storedHopitalId);
    setToken(storedToken);
  }, []);

  // Fetch stats et médecins en attente une fois hopitalId & token définis
  useEffect(() => {
    if (!hopitalId || !token) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/hopitaux/${hopitalId}/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement des stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPendingMedecins = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/hopitaux/${hopitalId}/medecins/en-attente`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Erreur lors du chargement des médecins en attente");
        const data = await res.json();
        setPendingMedecins(data.medecins || []);
      } catch (err) {
        console.error(err);
      }
    };

    Promise.all([fetchStats(), fetchPendingMedecins()]).finally(() => setLoading(false));
  }, [hopitalId, token]);

  if (!hopitalId || !token || loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={stats.totalPatients} label="Total patients" icon={<FaUser size={24} className="text-blue-600" />} />
            <StatCard value={stats.totalDoctors} label="Total médecins" icon={<FaUserMd size={24} className="text-green-600" />} />
            <StatCard value={stats.appointmentsToday} label="Rendez-vous aujourd'hui" icon={<FaCalendarCheck size={24} className="text-purple-600" />} />
            <StatCard value={stats.pendingAppointments} label="Rendez-vous en attente" icon={<FaHourglassHalf size={24} className="text-orange-500" />} />
          </div>

          {/* Charts */}
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartLine appointments={stats.appointments} />
            <BarChart appointments={stats.appointments} />
          </div>

          {/* Médecins en attente */}
          <div className="md:col-span-2">
            <MedecinPendingTable hopitalId={hopitalId} medecins={pendingMedecins} onUpdate={setPendingMedecins} />
          </div>

          <Todo medecinName="Dr. Dupont" onConfirm={() => console.log("Confirmé")} onCancel={() => console.log("Annulé")} />
        </main>
      </div>
    </div>
  );
}
