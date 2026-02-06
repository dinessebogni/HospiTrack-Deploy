'use client';

import { useEffect, useState } from 'react';
import { Evenement } from '../../hooks/useEvenements';
import { parseISO, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PlanningJourneeProps {
  medecinId: string;
  evenements?: Evenement[]; // <- optionnel : permet de passer des événements déjà récupérés
}

interface EventWithDate extends Omit<Evenement, 'start' | 'end'> {
  start: Date;
  end: Date;
  extendedProps: Evenement['extendedProps'] & { medecinId: string };
}

export default function PlanningJournee({ medecinId, evenements: initialEvenements }: PlanningJourneeProps) {
  const [evenements, setEvenements] = useState<EventWithDate[]>([]);
  const today = new Date();

  useEffect(() => {
    if (initialEvenements && initialEvenements.length > 0) {
      // Si on reçoit déjà des événements depuis les props (Dashboard)
      const eventsFormatted: EventWithDate[] = initialEvenements
        .map((e) => ({
          ...e,
          start: typeof e.start === 'string' ? parseISO(e.start) : e.start,
          end: typeof e.end === 'string' ? parseISO(e.end) : e.end,
          extendedProps: e.extendedProps as EventWithDate['extendedProps'],
        }))
        .filter(
          (e): e is EventWithDate =>
            e.start instanceof Date &&
            e.end instanceof Date &&
            isSameDay(e.start, today)
        );

      eventsFormatted.sort((a, b) => a.start.getTime() - b.start.getTime());
      setEvenements(eventsFormatted);
      return;
    }

    // Sinon, fetch depuis l'API
    const fetchEvenements = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/evenements/jour/${medecinId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Impossible de récupérer les événements');

        const data: Evenement[] = await res.json();

        const eventsFormatted: EventWithDate[] = data
          .map((e) => ({
            ...e,
            start: typeof e.start === 'string' ? parseISO(e.start) : e.start,
            end: typeof e.end === 'string' ? parseISO(e.end) : e.end,
            extendedProps: e.extendedProps as EventWithDate['extendedProps'],
          }))
          .filter(
            (e): e is EventWithDate =>
              e.start instanceof Date &&
              e.end instanceof Date &&
              isSameDay(e.start, today)
          );

        eventsFormatted.sort((a, b) => a.start.getTime() - b.start.getTime());
        setEvenements(eventsFormatted);
      } catch (err) {
        console.error(err);
      }
    };

    fetchEvenements();
  }, [medecinId, initialEvenements]);

  if (evenements.length === 0) {
    return (
      <p className="mt-6 text-gray-500 dark:text-gray-400">
        Aucun événement prévu aujourd’hui.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-xl font-bold mb-2 flex flex-wrap items-center gap-2">
        Planning du jour –
        <span
          className="text-green-700 text-opacity-80 truncate max-w-xs inline-block"
          title={format(today, 'eeee d MMMM yyyy', { locale: fr })}
        >
          {format(today, 'eeee d MMMM yyyy', { locale: fr })}
        </span>
      </h2>

      <ul className="space-y-2">
        {evenements.map((event) => (
          <li key={event.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow">
            <p className="font-semibold truncate" title={event.title || 'Sans titre'}>
              {event.title || 'Sans titre'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </p>
            <p className="text-sm italic">{event.extendedProps.type || 'Type non précisé'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
