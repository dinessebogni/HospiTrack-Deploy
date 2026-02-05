import { Evenement } from "../../hooks/useEvenements";
import { FiEdit, FiX, FiXCircle } from "react-icons/fi"; // Icônes Feather
import { MdClose } from "react-icons/md";

interface EventDetailsProps {
  event: Evenement;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (event: Evenement) => void;
}

export default function EventDetails({ event, onClose, onDelete, onEdit }: EventDetailsProps) {
  return (
    <div className="absolute top-10 right-10 bg-white dark:bg-gray-900 border dark:border-gray-700 shadow-xl p-4 rounded-lg w-80 z-50 text-gray-800 dark:text-gray-200">
      <h3 className="text-lg font-bold mb-2">{event.title}</h3>

      <p><strong>Type :</strong> {event.extendedProps?.type}</p>
      <p><strong>Début :</strong> {event.start ? new Date(event.start).toLocaleString('fr-FR') : '-'}</p>
      <p><strong>Fin :</strong> {event.end ? new Date(event.end).toLocaleString('fr-FR') : '-'}</p>
      <p><strong>Visibilité :</strong> {event.extendedProps?.visibilite}</p>
      <p>
        <strong>Notification :</strong>{" "}
        {event.extendedProps?.notification
          ? `Oui (${event.extendedProps.notificationTime} min avant)`
          : "Non"}
      </p>

      <div className="mt-4 flex justify-between gap-2">
        {/* Bouton Modifier */}
        <button
          onClick={() => onEdit(event)}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          <FiEdit size={16} /> Modifier
        </button>

        {/* Bouton Supprimer */}
        <button
          onClick={() => {
            if (confirm("Supprimer cet événement ?") && event.id) {
              onDelete(event.id);
              onClose();
            }
          }}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
        >
          <FiX size={16} /> Supprimer
        </button>

        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-black dark:text-white rounded"
        >
          <MdClose size={16} /> Fermer
        </button>
      </div>
    </div>
  );
}
