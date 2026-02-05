'use client';

import { useEffect, useState } from 'react';
import { FaStethoscope, FaBell, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import Link from 'next/link';

interface ActionsRapidesProps {
  medecinId: number;
}

export default function ActionsRapides({ medecinId }: ActionsRapidesProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const btnClasses =
    'flex flex-col items-center justify-center bg-white dark:bg-gray-800 hover:shadow-lg p-8 rounded-xl text-center text-xl font-semibold space-y-4 transition transform hover:scale-105 w-full';

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-8 rounded-xl shadow-xl w-full max-w-5xl mx-auto">
      <h3 className="text-3xl font-bold mb-8 text-center">Actions rapides</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          href={`/Doctor/agenda?medecinId=${medecinId}#evenement`}
          className={`${btnClasses} transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '100ms' }}
        >
          <div className="bg-green-600 p-6 rounded-full">
            <FaStethoscope className="text-white text-5xl" />
          </div>
          <span className="text-gray-900 dark:text-white">
            Créer un<br />nouvel événement
          </span>
        </Link>

        <Link
          href="/Doctor/mes-patients" 
          className={`${btnClasses} transition-all duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="bg-purple-600 p-6 rounded-full">
            <FaUserMd className="text-white text-5xl" />
          </div>
          <span className="text-gray-900 dark:text-white">
            Passer<br />une consultation
          </span>
        </Link>

        <Link
          href={`/Doctor/mes-rendezvous?medecinId=${medecinId}`}
          className={`${btnClasses} transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="bg-purple-600 p-6 rounded-full">
            <FaCalendarAlt className="text-white text-5xl" />
          </div>
          <span className="text-gray-900 dark:text-white">
            Gérer<br />les rendez-vous
          </span>
        </Link>

        <Link
          href={`/Doctor/mes-notifications?medecinId=${medecinId}`}
          className={`${btnClasses} transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          <div className="bg-red-500 p-6 rounded-full">
            <FaBell className="text-white text-5xl" />
          </div>
          <span className="text-gray-900 dark:text-white text-center">
            Gérer mes<br />notifications
          </span>
        </Link>
      </div>
    </div>
  );
}
