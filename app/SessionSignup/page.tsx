"use client";

import React from 'react';
import AuthForm from '../../components/AuthForm';
import RootLayout from '../../app/layout';

export default function SignupPage() {
  async function handleSignup(data: { name: string; email: string; password: string }) {
    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const result = await res.json();

      localStorage.setItem('token', result.token);

      window.location.href = '/SessionLogin';
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <AuthForm mode="signup" onSubmit={handleSignup} />
    </div>
  );
}
