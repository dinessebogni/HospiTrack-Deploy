"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const AuthForm = dynamic(() => import("../../components/AuthForm"), { ssr: false });

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const userStr = localStorage.getItem("currentUser");
    if (userStr) {
      const user = JSON.parse(userStr);
      redirectByRole(user.role, user.hopitalId, user.medecinId);
    }
  }, []);

  async function handleLogin(data: { email: string; password: string }) {
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || `Erreur HTTP ${res.status}`);

      // Stocker les infos utilisateur directement depuis la réponse
      const currentUser = {
        _id: result.id || result._id,
        name: result.name,
        role: result.role.toLowerCase(),
        medecinId: result.medecinId ?? null,
        hopitalId: result.hopitalId ?? null,
      };

      localStorage.setItem("token", result.token);
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      localStorage.setItem("role", currentUser.role);
      localStorage.setItem("name", currentUser.name);
      localStorage.setItem("medecinId", currentUser.medecinId ?? "");
      localStorage.setItem("hopitalId", currentUser.hopitalId ?? "");

      redirectByRole(currentUser.role, currentUser.hopitalId, currentUser.medecinId);
    } catch (err: any) {
      alert(err.message);
      localStorage.clear();
    }
  }

  function redirectByRole(role: string, hopitalId: string | null, medecinId: string | null) {
    if (role === "patient") router.replace("/Patient");
    else if (role === "medecin") router.replace(medecinId ? "/Doctor" : "/SessionLogin");
    else if (role === "admin-hopital") router.replace(hopitalId ? "/Admin" : "/SessionLogin");
    else router.replace("/SessionLogin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm mode="login" onSubmit={handleLogin} />
    </div>
  );
}
