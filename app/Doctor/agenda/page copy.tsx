'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

import Navbar from '../../../components/Doctor/NavbarMA';
import EvenementForm from '../../../components/Doctor/EvenementForm';
import EventDetails from '../../../components/Doctor/EventDetails';
import SidebarMedecin from '../../../components/Doctor/SidebarMedecin';

import { Evenement, useGestionEvenements } from '../../../hooks/useEvenements';

interface Medecin {
  id: string;
  nom: string;
  avatar: string;
}

const medecins: Medecin[] = [
  {
    id: '1',
    nom: 'Dr. Antoine Durand',
    avatar: '/avatars/antoine.jpg',
  },
  {
    id: '2',
    nom: 'Dr. Marie Lefèvre',
    avatar: '/avatars/marie.jpg',
  },
  {
    id: '3',
    nom: 'Dr. Thomas Bernard',
    avatar: '/avatars/thomas.jpg',
  },
];

export default function AgendaMedecin() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [selectedMedecin, setSelectedMedecin] = useState<Medecin>(medecins[0]);

  const { ajouterEvenement } = useGestionEvenements({ events, setEvents });

  useEffect(() => {
    const stored = localStorage.getItem('evenements');
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch (e) {
        console.error('Erreur parsing événements', e);
      }
    }
  }, []);

  const handleSelect = (info: any) => {
    setSelectedRange({ start: info.startStr, end: info.endStr });
    setSelectedEvent(null);
  };

  const handleEventClick = (info: any) => {
    const event: Evenement = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      extendedProps: info.event.extendedProps,
    };
    setSelectedEvent(event);
    setSelectedRange(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <SidebarMedecin
        selectedMedecin={selectedMedecin}
        setSelectedMedecin={setSelectedMedecin}
        medecins={medecins}
        evenements={events}
      />

      {/* Contenu principal */}
      <div className="flex-1 p-4 relative">
        <Navbar />

        <div className="mt-6">
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            locales={[frLocale]}
            locale="fr"
            selectable
            select={handleSelect}
            events={events.filter(e => e.extendedProps?.medecinId === selectedMedecin.id)}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            allDaySlot={false}
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            eventDidMount={(info) => {
              const visibilite = info.event.extendedProps?.visibilite;
              if (visibilite === 'Médecin seulement') {
                info.el.style.backgroundColor = '#dc2626';
                info.el.style.borderColor = '#dc2626';
                info.el.style.color = 'white';
              }
            }}
          />
        </div>

        {selectedEvent && (
          <EventDetails event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}

        <EvenementForm
          start={selectedRange?.start || (selectedEvent?.start as string)}
          end={selectedRange?.end || (selectedEvent?.end as string)}
          onSave={(e) =>
            ajouterEvenement({
              ...e,
              extendedProps: {
                ...e.extendedProps,
                medecinId: selectedMedecin.id,
              },
            })
          }
          existingEvent={selectedEvent ?? undefined}
        />
      </div>
    </div>
  );
}
