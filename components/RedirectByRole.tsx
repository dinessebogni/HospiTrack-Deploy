"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RedirectByRole() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role")?.toLowerCase();

    switch (role) {
      case "patient":
        router.replace("/Patient");
        break;
      case "medecin":
      case "admin-hôpital":
        router.replace("/AccueilMA");
        break;
      default:
        router.replace("/Accueil");
    }
  }, [router]);

  return null; 
}
