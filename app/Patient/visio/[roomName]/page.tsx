'use client';

import { useParams } from 'next/navigation';
import VisioCall from '../../../../components/VisioCall';

export default function PatientVisioPage() {
  const params = useParams();
  const roomNameParam = params.roomName;
  const roomName = Array.isArray(roomNameParam) ? roomNameParam[0] : roomNameParam;

  if (!roomName) return <p className="p-4">Chargement de la salle...</p>;

  // On ne passe que roomName
  return <VisioCall roomName={roomName} />;
}
