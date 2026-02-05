'use client';

import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

import Navbar from '../../../components/Doctor/NavbarMA';
import EvenementForm from '../../../components/Doctor/EvenementForm';
import EventDetails from '../../../components/Doctor/EventDetails';
import { Evenement } from '../../../hooks/useEvenements';

interface AgendaMedecinProps {
  medecinId: string;
}

export default function AgendaMedecin({ medecinId }: AgendaMedecinProps) {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formEvent, setFormEvent] = useState<Evenement | null>(null);

  useEffect(() => {
    const medecinId = localStorage.getItem('medecinId');
    console.log("Récupération medecinId :", medecinId);
    if (!medecinId) {
      console.error("medecinId non défini");
      return;
    }
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:8000/api/evenements/${medecinId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Impossible de charger les événements');
        const data = await res.json();
        console.log("Evenements medecin :",data);
        // Mapper _id en id pour TypeScript
        const eventsWithId: Evenement[] = (data || []).map((ev: any) => ({
          ...ev,
          id: ev._id, 
        }));

         setEvents(eventsWithId); 
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, [medecinId]);

  // Style selon visibilité
  const getEventStyle = (event: Evenement) => {
    if (event.extendedProps?.visibilite === 'Médecin seulement') return { backgroundColor: '#dc2626', color: 'white' };
    if (event.extendedProps?.visibilite === 'Interne') return { backgroundColor: '#2563eb', color: 'white' };
    return { backgroundColor: '#10b981', color: 'white' };
  };

  // Après création ou modification (POST/PUT)
  const handleSaveEvent = (savedEvent: Evenement) => {
    setEvents(prevEvents => {
      const index = prevEvents.findIndex(ev => ev.id === savedEvent.id);
      if (index >= 0) {
        // Modification d’un événement existant
        const newEvents = [...prevEvents];
        newEvents[index] = savedEvent;
        return newEvents;
      } else {
        // Création d’un nouvel événement
        return [...prevEvents, savedEvent];
      }
    });
  
    setShowForm(false);
    setFormEvent(null);
    setSelectedEvent(null);
    setSelectedRange(null);
  };
  
  // Supprimer un événement via API
  const handleDeleteEvent = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/evenements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Impossible de supprimer');
  
      // Supprime directement du state → FullCalendar se met à jour automatiquement
      setEvents(prevEvents => prevEvents.filter(ev => ev.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-4 space-y-6 relative min-h-screen">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locales={[frLocale]}
          locale="fr"
          selectable
          editable
          eventResizableFromStart
          events={events}
          select={(info) => {
            setSelectedRange({ start: info.startStr, end: info.endStr });
            setFormEvent(null);
            setSelectedEvent(null);
            setShowForm(true); // ouvre le formulaire pour création
          }}
          eventClick={(info) => {
            setSelectedEvent({
              id: info.event.id,
              title: info.event.title,
              start: info.event.start!,
              end: info.event.end!,
              extendedProps: {
                ...info.event.extendedProps,
                medecinId, 
              },
            });
            setSelectedRange(null);
            setFormEvent(null);
          }}
          eventDrop={(info) => {
            handleSaveEvent({
              id: info.event.id,
              title: info.event.title,
              start: info.event.start!.toISOString(),
              end: info.event.end!.toISOString(),
              extendedProps: { ...info.event.extendedProps, medecinId },
            });
          }}
          eventResize={(info) => {
            handleSaveEvent({
              id: info.event.id,
              title: info.event.title,
              start: info.event.start!.toISOString(),
              end: info.event.end!.toISOString(),
              extendedProps: { ...info.event.extendedProps, medecinId },
            });
          }}
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          allDaySlot={false}
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventContent={(info) => <div style={getEventStyle(info.event.extendedProps as Evenement)}>{info.event.title}</div>}
        />

        {/* Détails d’un événement */}
        {selectedEvent && (
          <EventDetails
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onDelete={handleDeleteEvent}
            onEdit={(event) => {
              setFormEvent(event);
              setShowForm(true);
              setSelectedEvent(null);
            }}
          />
        )}

        {/* Formulaire création / modification */}
{showForm && (selectedRange || selectedEvent) && (
  <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl p-4">
    <EvenementForm
      start={selectedRange?.start || (selectedEvent?.start as string) || ''}
      end={selectedRange?.end || (selectedEvent?.end as string) || ''}
      medecinId={medecinId}
      existingEvent={selectedEvent ?? undefined}
      onSave={(e) => {
        handleSaveEvent(e);
        setShowForm(false);
        setFormEvent(null);
        setSelectedEvent(null);
        setSelectedRange(null);
      }}
    />
  </div>
)}

      </div>
    </>
  );
}
