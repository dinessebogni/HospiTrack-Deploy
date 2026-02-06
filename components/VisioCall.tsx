'use client';

import React, { useEffect, useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';

interface JitsiMeetingWrapperProps {
  roomName: string;
}

export default function JitsiMeetingWrapper({ roomName }: JitsiMeetingWrapperProps) {
  const [displayName, setDisplayName] = useState<string>('Invité');
  const [email, setEmail] = useState<string>('guest@example.com');
  const [loading, setLoading] = useState<boolean>(true);

  // Récupération profil utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setDisplayName(data.nom || 'Utilisateur');
        setEmail(data.email || 'user@example.com');
      })
      .catch((err) => console.error('Erreur récupération profil:', err))
      .finally(() => setLoading(false));
  }, []);

  // Vérification micro/cam avant lancement
  useEffect(() => {
    if (!loading) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => console.error('Erreur micro/vidéo avant Jitsi:', err));
    }
  }, [loading]);

  if (loading || !roomName) return <p className="p-4">Chargement de la salle...</p>;

  return (
    <div className="w-full h-screen">
      <JitsiMeeting
        domain="meet.jit.si"
        roomName={roomName}
        userInfo={{ displayName, email }}
        configOverwrite={{
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          constraints: { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15, max: 30 } }, audio: true },
        }}
        interfaceConfigOverwrite={{
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'hangup', 'tileview'],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
        }}
        onApiReady={(api: any) => {
          api.addEventListener('videoConferenceJoined', () => console.log('Connecté à la salle'));
          api.addEventListener('incomingMessage', (msg: any) => console.log('Message entrant:', msg));
          api.addEventListener('cameraError', (err: any) => console.error('Erreur caméra:', err));
          api.addEventListener('micError', (err: any) => console.error('Erreur micro:', err));
        }}
        getIFrameRef={(iframeRef) => {
          iframeRef.style.height = '100%';
          iframeRef.style.width = '100%';
        }}
      />
    </div>
  );
}
