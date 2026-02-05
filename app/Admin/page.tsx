"use client";
import DashboardAdmin from "../../components/Admin/DashboardAdmin";

export default function Dashboard() {
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") || "" : "";

  return (
    <div className="flex min-h-screen ">
      <div className="flex-1">
        <DashboardAdmin userId={userId} />
      </div>
    </div>
  ); 
}
