"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import ThemeToggle from "../ThemeToggle";
import ProfilContainer from "../ProfilContainer";
import Image from "next/image";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  // --- Récupérer les notifications ---
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:8000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        const data = await res.json();

        const notifs: Notification[] = Array.isArray(data.notifications)
          ? data.notifications
          : Array.isArray(data)
          ? data
          : [];

        // Notification bienvenue
        const isFirstVisit = !localStorage.getItem("firstVisit");
        if (isFirstVisit) {
          localStorage.setItem("firstVisit", "true");
          const welcomeNotification: Notification = {
            _id: "welcome",
            message: "Bienvenue sur la plateforme HospiTrack",
            read: false,
            createdAt: new Date().toISOString(),
          };
          setNotifications([welcomeNotification, ...notifs]);
        } else {
          setNotifications(notifs);
        }
      } catch (err) {
        console.error("Erreur récupération notifications:", err);
        setNotifications([]);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // --- Marquer une notification comme lue ---
  const markAsRead = async (_id: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!_id || !token) return;

      await fetch(`http://localhost:8000/api/notifications/${_id}/read`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((current) =>
        current.map((n) => (n._id === _id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Erreur marquer lu:", err);
    }
  };

  // --- Tout marquer lu ---
  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) =>
            fetch(`http://localhost:8000/api/notifications/${n._id}/read`, {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            })
          )
      );

      setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Erreur tout marquer lu:", err);
    }
  };

  const links = [
    { href: "/Patient", label: "Accueil" },
    { href: "/Patient/consultation", label: "Medécins" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="relative bg-green-600 dark:bg-green-800 text-white px-4 py-3 rounded-md shadow flex items-center justify-between transition-colors duration-300 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/images/logo.png" width={120} height={120} alt="logo" className="p-2" />
      </div>

      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6 items-center text-sm font-medium relative">
        {links.map(({ href, label }) => (
          <li
            key={href}
            className={`hover:text-green-900 ${pathname === href ? "underline font-bold" : ""}`}
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
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-gray-500">Aucune notification</p>
              ) : (
                <ul>
                  {notifications.map((notif) => (
                    <li
                      key={notif._id}
                      className={`p-3 border-b dark:border-gray-700 cursor-pointer ${
                        !notif.read ? "bg-green-100 dark:bg-green-700" : ""
                      }`}
                      onClick={() => markAsRead(notif._id)}
                    >
                      <p>{notif.message}</p>
                      {notif.createdAt && (
                        <small className="text-xs text-gray-600 dark:text-gray-300">
                          {new Date(notif.createdAt).toLocaleString()}
                        </small>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </li>

        {/* Profil */}
        <li>
          <ProfilContainer />
        </li>

        {/* Theme Toggle */}
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
        <ul className="absolute top-16 left-0 w-full bg-green-600 dark:bg-green-800 text-white flex flex-col gap-4 p-4 shadow-md md:hidden z-50">
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
          <li>
            <ProfilContainer />
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
