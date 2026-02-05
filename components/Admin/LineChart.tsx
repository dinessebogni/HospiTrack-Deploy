"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Appointment } from "../../hooks/stat";

interface ChartLineProps {
  appointments?: Appointment[]; // optionnel pour éviter les erreurs initiales
}

const ChartLine = ({ appointments = [] }: ChartLineProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const data = days.map((day) => {
    const count = appointments.filter(
      (a) => new Date(a.start).getDay() === days.indexOf(day)
    ).length;
    return { day, appts: count };
  });

  return (
    <div className="bg-white shadow rounded-xl p-4 h-64">
      <h2 className="font-semibold mb-2">Rendez-vous par jour</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="appts" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartLine;
