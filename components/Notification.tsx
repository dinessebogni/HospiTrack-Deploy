"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";

interface Notification {
  id: number;
  message: string;
  read: boolean;
  date?: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn("Pas de token trouvé, notifications non récupérées");
        return;
      }
      const res = await fetch("http://localhost:8000/api/notifications", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erreur lors de la récupération des notifications");
      const data: Notification[] = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error("Fetch notifications failed:", error);
    }
  };
  fetchNotifications();
}, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  };

  const links = [
    { href: "/", label: "Accueil" },
    { href: "/Doctor/agenda", label: "Mon Agenda" },
    { href: "/patient", label: "Mes patients" },
    { href: "/Doctor/visio", label: "Messagerie" },
  ];

  return (
    <nav className="relative bg-green-600 dark:bg-green-800 text-white px-4 py-3 rounded-md shadow flex items-center justify-between transition-colors duration-300 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-full p-1 font-bold text-lg w-6 h-6 flex items-center justify-center">
          +
        </div>
        <span className="hidden sm:inline text-lg font-semibold">HospiTrack</span>
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 items-center text-sm font-medium relative">
        {links.map(({ href, label }) => (
          <li
            key={href} 
            className={`hover:text-green-900 ${
              pathname === href ? "underline font-bold" : ""
            }`}
          >
            <Link href={href}>{label}</Link>
          </li>
        ))}

        {/* Notifications */}
        <li className="relative">
          <button
            aria-label="Notifications"
            className="relative"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border dark:border-gray-700 rounded shadow-lg z-50 text-gray-900 dark:text-white">
              <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
                <h3 className="font-semibold">Notifications</h3>
                <button
                  className="text-sm text-blue-600 hover:underline"
                  onClick={markAllRead}
                >
                  Tout marquer lu
                </button>
              </div>
              {notifications.length === 0 && (
                <p className="p-4 text-center text-gray-500">Aucune notification</p>
              )}
              <ul>
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className={`p-3 border-b dark:border-gray-700 cursor-pointer ${
                      !notif.read ? "bg-green-100 dark:bg-green-700" : ""
                    }`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <p>{notif.message}</p>
                    {notif.date && (
                      <small className="text-xs text-gray-600 dark:text-gray-300">
                        {new Date(notif.date).toLocaleString()}
                      </small>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>

        <li className="hover:text-green-900">
          <Link href="/profil">
            <User className="h-5 w-5" />
          </Link>
        </li>

        <li>
          <ThemeToggle />
        </li>
      </ul>

      {/* Mobile Menu Toggle */}
      <button
        id="mobile-menu-button"
        aria-controls="mobile-menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
        className="md:hidden text-2xl"
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <ul
          id="mobile-menu"
          role="menu"
          aria-labelledby="mobile-menu-button"
          className="absolute top-16 left-0 w-full bg-green-600 dark:bg-green-800 text-white flex flex-col gap-4 p-4 shadow-md md:hidden z-50"
        >
          {links.map(({ href, label }) => (
            <li key={href} className="hover:text-green-900">
              <Link href={href}>{label}</Link>
            </li>
          ))}
          <li className="hover:text-green-900">
            <button aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 rounded-full text-xs w-5 h-5 flex items-center justify-center font-semibold">
                  {unreadCount}
                </span>
              )}
            </button>
          </li>
          <li className="hover:text-green-900">
            <Link href="/profil">
              <User className="h-5 w-5" />
            </Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
