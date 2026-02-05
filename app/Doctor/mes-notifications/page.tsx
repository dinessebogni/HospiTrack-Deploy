'use client';

import { useEffect, useState } from 'react';
import SidebarMedecin from '../../../components/Doctor/SidebarMedecin';
import Navbar from '../../../components/Doctor/NavbarMA';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { FaCheck } from 'react-icons/fa';

type Notification = {
  _id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function MesNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Impossible de récupérer les notifications');

      const data = await res.json();
      console.log('Notifications API:', data);

      // Vérifie si c’est un tableau
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8000/api/notifications/${id}/read`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Impossible de marquer comme lu');

      // Mise à jour locale immédiate
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erreur inconnue');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <SidebarMedecin evenements={[]} />
      <main className="flex-1 p-6">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Mes notifications</h1>
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  await Promise.all(
                    notifications
                      .filter((notif) => !notif.read)
                      .map((notif) =>
                        fetch(`http://localhost:8000/api/notifications/${notif._id}/read`, {
                          method: 'GET',
                          headers: { Authorization: `Bearer ${token}` },
                        })
                      )
                  );
                  // Mise à jour locale
                  setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
                } catch (err) {
                  console.error(err);
                  setError('Impossible de marquer toutes les notifications comme lues');
                }
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Tout marquer comme lu
            </button>
          </div>

          {loading && <LoadingSpinner />}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {!loading && (!notifications || notifications.length === 0) && (
            <p className="text-gray-600">Vous n'avez aucune notification.</p>
          )}

          <ul className="space-y-4">
            {Array.isArray(notifications) &&
              notifications.map((notif) => (
                <li
                  key={notif._id}
                  className={`p-4 rounded shadow flex justify-between items-center ${
                    notif.read ? 'bg-gray-200' : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <div>
                    <p>{notif.message}</p>
                    <small className="text-gray-500">
                      {new Date(notif.createdAt).toLocaleString()}
                    </small>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="ml-4 p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                    >
                      <FaCheck />
                    </button>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
