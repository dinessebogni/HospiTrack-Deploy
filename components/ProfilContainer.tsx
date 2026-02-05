'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from "lucide-react";
import ProfilPopup from './ProfilPopup';
import ProfilEditForm from './ProfilEditForm';

export default function ProfilContainer() {
  const [showPopup, setShowPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // ref pour détecter clic hors popup et bouton
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPopup) return;

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }

    fetch('http://localhost:8000/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Erreur lors du chargement');
        }
        return res.json();
      })
      .then(data => {
        setNom(data.name || '');
        setEmail(data.email || '');
        setAvatar(data.avatar || '');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [showPopup]);

  async function handleSave(data: { name: string; email: string; avatar: string }) {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Token manquant');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erreur serveur');
      }

      const updated = await res.json();
      setNom(updated.name || '');
      setEmail(updated.email || '');
      setAvatar(updated.avatar || '');
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Gestion clic hors popup pour fermer
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
        setEditing(false);
      }
    }
    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => {
          setShowPopup(prev => !prev);
          setEditing(false);
        }}
        aria-label="Voir profil"
        className="flex items-center gap-1"
      >
        <User className="h-5 w-5 text-white" />
      </button>

      {showPopup && !editing && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <ProfilPopup
            nom={nom}
            email={email}
            avatar={avatar}
            onClose={() => setShowPopup(false)}
            onEdit={() => setEditing(true)}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {showPopup && editing && (
        <div className="absolute top-full mt-2 right-0 z-50">
          <ProfilEditForm
            nomInitial={nom}
            emailInitial={email}
            avatarInitial={avatar}
            onCancel={() => setEditing(false)}
            onSave={handleSave}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
}
