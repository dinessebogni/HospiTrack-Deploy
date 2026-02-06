'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import JitsiMeetingWrapper from '../../../../components/VisioCall';

export default function DoctorVisioPage() {
  const params = useParams();
  const roomNameParam = params.roomName;
  const roomName = Array.isArray(roomNameParam) ? roomNameParam[0] : roomNameParam;

  // Tu peux gérer un état local pour loading ou infos utilisateur si nécessaire
  if (!roomName) {
    return <p className="p-4">Chargement de la salle...</p>;
  }

  return <JitsiMeetingWrapper roomName={roomName} />;
}
