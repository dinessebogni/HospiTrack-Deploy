'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import Navbar from '../../components/Doctor/NavbarMA';
import EventDetails from '../../components/Doctor/EventDetails';
import EvenementForm, { Evenement } from '../../components/Doctor/EvenementForm';

interface AgendaMedecinProps {
  medecinId: string;
}

export default function AgendaMedecin({ medecinId }: AgendaMedecinProps) {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);

  // Ajouter un événement
  const ajouterEvenement = (e: Evenement) => setEvents((prev) => [...prev, e]);

  // Supprimer un événement par id
  const supprimerEvenement = (id?: string) =>
    setEvents((prev) => prev.filter((ev) => ev.id !== id));

  // Sélection d'une plage horaire
  const handleSelect = (info: any) => {
    setSelectedRange({ start: info.startStr, end: info.endStr });
    setSelectedEvent(null);
  };

  // Clic sur un événement
  const handleEventClick = (info: any) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start?.toISOString() || '',
      end: info.event.end?.toISOString() || '',
      extendedProps: info.event.extendedProps,
    });
    setSelectedRange(null);
  };

  // Convertit string|undefined en ISO string
  const toISOString = (value?: string): string => (!value ? '' : new Date(value).toISOString());

  // Scroll automatique vers le formulaire si hash #evenement
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#evenement') {
      const el = document.getElementById('evenement');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="relative">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locales={[frLocale]}
          locale="fr"
          selectable
          select={handleSelect}
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          allDaySlot={false}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />

        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onDelete={(id) => {
              supprimerEvenement(id);
              setSelectedEvent(null);
            }}
            onEdit={(event) => setSelectedEvent(event)}
          />
        )}

        <div id="evenement">
          <EvenementForm
            start={selectedRange?.start ?? toISOString(selectedEvent?.start)}
            end={selectedRange?.end ?? toISOString(selectedEvent?.end)}
            existingEvent={selectedEvent ?? undefined}
            medecinId={medecinId}
            onSave={ajouterEvenement}
          />
        </div>
      </div>
    </>
  );
}
