'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import VisioCall from '../../../../components/VisioCall';

export default function DoctorVisioPage() {
  const params = useParams();
  const roomNameParam = params.roomName;
  const roomName = Array.isArray(roomNameParam) ? roomNameParam[0] : roomNameParam;

  const [displayName, setDisplayName] = useState('Médecin');
  const [email, setEmail] = useState('medecin@example.com');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setDisplayName(data.nom || 'Médecin');
        setEmail(data.email || 'medecin@example.com');
      })
      .catch(err => console.error('Erreur récupération profil:', err));
  }, []);

  if (!roomName) return <p className="p-4">Chargement de la salle...</p>;

  return <VisioCall roomName={roomName} displayName={displayName} email={email} />;
}
