'use client';

import { Dispatch, SetStateAction } from 'react';

export interface Evenement { 
  id?: string;
  title: string;
  start: string | Date;
  end: string | Date;
  extendedProps?: {
    type?: string;
    visibilite?: string;
    notification?: boolean;
    notificationTime?: number;
    medecinId: string; 
  };
}

interface Props {
  events: Evenement[];
  setEvents: Dispatch<SetStateAction<Evenement[]>>;
  medecinId: string;
}

export function useGestionEvenements({ events, setEvents, medecinId }: Props) {
  const ajouterEvenement = (event: Evenement) => {
    const eventWithMedecinId: Evenement = {
      ...event,
      id: event.id || new Date().getTime().toString(),
      extendedProps: {
        ...event.extendedProps,
        medecinId: medecinId || event.extendedProps?.medecinId || '',
      },
    };

    const exists = events.find((e) => e.id === eventWithMedecinId.id);
    if (exists) {
      setEvents(events.map((e) => (e.id === eventWithMedecinId.id ? eventWithMedecinId : e)));
    } else {
      setEvents([...events, eventWithMedecinId]);
    }
  };

  const supprimerEvenement = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return { ajouterEvenement, supprimerEvenement };
}
