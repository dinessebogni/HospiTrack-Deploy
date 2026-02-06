'use client';

import { useEffect, useState } from 'react';
import { parseISO, format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Evenement } from '../../hooks/useEvenements';

interface PlanningJourneeProps {
  medecinId: string;
  evenements?: Evenement[]; // possibilité de passer les événements depuis le parent
}

interface EventWithDate extends Omit<Evenement, 'start' | 'end'> {
  start: Date;
  end: Date;
  extendedProps: Evenement['extendedProps'] & { medecinId: string };
}

export default function PlanningJournee({ medecinId, evenements = [] }: PlanningJourneeProps) {
  const [eventsFormatted, setEventsFormatted] = useState<EventWithDate[]>([]);
  const today = new Date();

  useEffect(() => {
    const processEvents = (events: Evenement[]) => {
      const formatted: EventWithDate[] = events
        .map(e => ({
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
        )
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      setEventsFormatted(formatted);
    };

    // Si le parent a passé les événements, on les utilise
    if (evenements.length > 0) {
      processEvents(evenements);
    } else {
      // Sinon fetch côté client
      const fetchEvenements = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`http://localhost:8000/api/evenements/jour/${medecinId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Impossible de récupérer les événements');

          const data: Evenement[] = await res.json();
          processEvents(data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchEvenements();
    }
  }, [medecinId, evenements]);

  if (eventsFormatted.length === 0) {
    return <p className="mt-6 text-gray-500 dark:text-gray-400">Aucun événement prévu aujourd’hui.</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        Planning du jour –
        <span
          className="text-green-700 text-opacity-80 truncate max-w-xs inline-block"
          title={format(today, 'eeee d MMMM yyyy', { locale: fr })}
        >
          {format(today, 'eeee d MMMM yyyy', { locale: fr })}
        </span>
      </h2>

      <ul className="space-y-2">
        {eventsFormatted.map(event => (
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
