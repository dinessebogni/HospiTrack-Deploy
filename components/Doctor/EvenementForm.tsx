'use client';

import { useState, useEffect } from 'react';
import { Evenement } from '../../hooks/useEvenements';

interface EvenementFormProps {
  start: string;
  end: string;
  medecinId: string;
  existingEvent?: Evenement;
  onSave?: (event: Evenement) => void;
}

// Convertit datetime-local ou Date en ISO UTC
function localDateTimeToUTC(input: string | Date | undefined): string {
  if (!input) return '';
  const d = typeof input === 'string' ? new Date(input) : input;
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

// Formate ISO ou Date pour input[type=datetime-local]
function formatDateToInputValue(date: string | Date | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function EvenementForm({
  start,
  end,
  medecinId,
  existingEvent,
  onSave,
}: EvenementFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Consultation');
  const [visibilite, setVisibilite] = useState('Médecin seulement');
  const [notification, setNotification] = useState(true);
  const [notificationTime, setNotificationTime] = useState<number | ''>(15);
  const [startTime, setStartTime] = useState(formatDateToInputValue(start));
  const [endTime, setEndTime] = useState(formatDateToInputValue(end));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialiser le formulaire si existingEvent
  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title || '');
      setType(existingEvent.extendedProps?.type || 'Consultation');
      setVisibilite(existingEvent.extendedProps?.visibilite || 'Médecin seulement');
      setNotification(existingEvent.extendedProps?.notification ?? true);
      setNotificationTime(existingEvent.extendedProps?.notificationTime ?? 15);
      setStartTime(formatDateToInputValue(existingEvent.start));
      setEndTime(formatDateToInputValue(existingEvent.end));
    }
  }, [existingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !startTime || !endTime) return setError('Veuillez remplir tous les champs');

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    if (endDate <= startDate) return setError("L'heure de fin doit être après l'heure de début");

    const newEvent: Evenement = {
      id: existingEvent?.id || crypto.randomUUID(),
      title,
      start: localDateTimeToUTC(startTime),
      end: localDateTimeToUTC(endTime),
      extendedProps: {
        type,
        visibilite,
        notification,
        notificationTime: typeof notificationTime === 'number' ? notificationTime : 0,
        medecinId, // ici medecinId est toujours string
      },
    };

    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setError('Utilisateur non authentifié');
      setLoading(false);
      return;
    }

    try {
      const url = existingEvent
        ? `http://localhost:8000/api/evenements/${existingEvent.id}`
        : 'http://localhost:8000/api/evenements';

      const response = await fetch(url, {
        method: existingEvent ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Erreur lors de l’enregistrement');
      }

      const savedEvent = await response.json();
      if (onSave) onSave(savedEvent.evenement || savedEvent);

      if (!existingEvent) {
        setTitle('');
        setType('Consultation');
        setVisibilite('Médecin seulement');
        setNotification(true);
        setNotificationTime(15);
        setStartTime(formatDateToInputValue(start));
        setEndTime(formatDateToInputValue(end));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-900 border dark:border-gray-700 p-4 mt-4 rounded shadow space-y-3"
    >
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {existingEvent ? 'Modifier l’événement' : 'Nouvel événement'}
      </h2>

      <input
        type="text"
        placeholder="Titre"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Début
          </label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Fin
          </label>
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option>Consultation</option>
        <option>Chirurgie</option>
        <option>Réunion</option>
        <option>Pause</option>
      </select>

      <select
        value={visibilite}
        onChange={(e) => setVisibilite(e.target.value)}
        className="w-full p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option>Médecin seulement</option>
        <option>Interne</option>
        <option>Publique</option>
      </select>

      <label className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
        <input type="checkbox" checked={notification} onChange={(e) => setNotification(e.target.checked)} />
        <span>Activer une notification</span>
      </label>

      {notification && (
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min={0}
            value={notificationTime ?? ''}
            onChange={(e) => setNotificationTime(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Minutes"
            className="w-24 p-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">minutes avant l'événement</span>
        </div>
      )}

      {error && <div className="text-black bg-red-300 p-2 text-sm font-medium rounded">{error}</div>}

      <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
        {loading ? 'Enregistrement...' : existingEvent ? 'Modifier' : 'Ajouter'}
      </button>
    </form>
  );
}

export type { Evenement };
