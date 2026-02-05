'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatRoom from "../../../../components/ChatRoom";
import Navbar from "../../../../components/Doctor/NavbarMA";
import SidebarMedecin from "../../../../components/Doctor/SidebarMedecin";

interface User {
  _id: string;
  nom: string;
  role: "patient" | "medecin";
}

export default function DoctorChatPage() {
  const params = useParams();
  const patientIdParam = params.patientId;
  const patientId = Array.isArray(patientIdParam) ? patientIdParam[0] : patientIdParam;

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    console.log("user :", stored);
    if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  if (!currentUser) return <div>Chargement utilisateur...</div>;
  if (!patientId) return <div>ID patient invalide</div>;

  return (
    <div className="h-screen flex">
      <SidebarMedecin evenements={[]} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4">
          <ChatRoom
            currentUser={currentUser}
            otherUserId={patientId}
          />
        </div>
      </div>
    </div>
  );
}
