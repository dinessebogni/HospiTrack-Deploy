"use client";
import DashboardAdmin from "../../components/Admin/DashboardAdmin";

export default function Dashboard() {
  const hopitalId = typeof window !== "undefined" ? localStorage.getItem("hopitalId") || "" : "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  if (!hopitalId || !token) return <p>Chargement...</p>;

  return <DashboardAdmin hopitalId={hopitalId} token={token} />;
}
