"use client";
import { Home, User, Users, Calendar, Briefcase, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { label: "Dashboard", icon: <Home size={20} />, href: "/Admin" },
    { label: "Doctors", icon: <User size={20} />, href: "/Admin/doctors" },
    { label: "Patients", icon: <Users size={20} />, href: "/Admin/patients" },
    { label: "Appointments", icon: <Calendar size={20} />, href: "/Admin/appointments" },
    { label: "Services", icon: <Briefcase size={20} />, href: "/Admin/services" },
    { label: "Statistics", icon: <BarChart3 size={20} />, href: "/Admin/statistics" },
  ];

  const logoSrc = "/images/logo.png";
  const imageAlt = "logo";

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 min-h-screen w-64 bg-green-700 text-white p-4 z-50 transform transition-transform duration-300 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Image
          src={logoSrc}
          width={200}
          height={200}
          alt={imageAlt}
          className="block mb-0 p-4"
        />
        <ul className="space-y-4">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link
                href={item.href}
                className="flex items-center space-x-2 hover:text-gray-200"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
