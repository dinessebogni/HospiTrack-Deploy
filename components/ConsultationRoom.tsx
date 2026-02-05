"use client";

import { useEffect, useRef, useState } from "react";

type User = { name: string; role: "patient" | "medecin" };

export default function ConsultationRoom({
  roomName,
  password,
}: {
  roomName: string;
  password: string;
}) {
  const [user, setUser] = useState<User | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // récupérer le user
    fetch("http://localhost:8000/api/profile")
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  useEffect(() => {
    if (!user || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: containerRef.current!,
        userInfo: { displayName: user.name },
        configOverwrite: { prejoinPageEnabled: false },
      });
      api.addEventListener("videoConferenceJoined", () =>
        api.executeCommand("password", password)
      );
    };
    document.body.appendChild(script);

    return () => {
      document.querySelector(
        "script[src='https://meet.jit.si/external_api.js']"
      )?.remove();
    };
  }, [user, roomName, password]);

  if (!user) return <p>Chargement du profil...</p>;

  return <div ref={containerRef} className="w-full h-screen" />;
}
