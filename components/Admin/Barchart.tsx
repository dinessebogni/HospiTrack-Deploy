"use client";
import React from "react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Appointment } from "../../hooks/stat";

interface BarChartProps {
  appointments?: Appointment[]; // optionnel
}

export default function BarChart({ appointments = [] }: BarChartProps) {
  // Compter le nombre de rendez-vous par type
  const counts: Record<string, number> = {};
  appointments.forEach((a) => {
    const key = a.type || "Autre";
    counts[key] = (counts[key] || 0) + 1;
  });

  const data = Object.entries(counts).map(([department, doctors]) => ({
    department,
    doctors
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4">Disponnibilité médecin</h3>
      <ResponsiveContainer width="100%" height={250}>
        <ReBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="doctors" fill="#3b82f6" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
