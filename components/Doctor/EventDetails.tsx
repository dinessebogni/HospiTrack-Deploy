'use client';

import { Evenement } from './EvenementForm';

interface EventDetailsProps {
  event: Evenement;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: Evenement) => void;
}

export default function EventDetails({ event, onClose, onDelete, onEdit }: EventDetailsProps) {
  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border dark:border-gray-700 p-4 rounded shadow z-50 w-96">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{event.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Début : {new Date(event.start).toLocaleString()}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Fin : {new Date(event.end).toLocaleString()}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Type : {event.extendedProps?.type || 'Consultation'}
      </p>
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => onEdit(event)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
        >
          Modifier
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
        >
          Supprimer
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
