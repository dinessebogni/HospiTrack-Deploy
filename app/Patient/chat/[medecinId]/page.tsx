'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatRoom from "../../../../components/ChatRoom";
import Navbar from "../../../../components/Patient/Navbar";

interface User {
  _id: string;
  nom: string;
  role: "patient" | "medecin";
}

export default function PatientChatPage() {
  const params = useParams();
  const medecinIdParam = params.medecinId;
  const medecinId = Array.isArray(medecinIdParam) ? medecinIdParam[0] : medecinIdParam;

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    console.log("user :", stored);
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  if (!currentUser) return <div>Chargement utilisateur...</div>;
  if (!medecinId) return <div>ID médecin invalide</div>;

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 p-4">
        <ChatRoom
          currentUser={currentUser}
          otherUserId={medecinId}
        />
      </div>
    </div>
  );
}
