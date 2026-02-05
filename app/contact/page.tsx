'use client';

import Image from 'next/image';
import { useState } from 'react';
import Navbar from '../../components/Patient/Navbar';

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' });
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    setLoading(true);
    setErreur('');
    setEnvoye(false);

    try {
      const res = await fetch('https://hospitrack.system.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error('Erreur lors de l’envoi du message.');

      setEnvoye(true);
      setForm({ nom: '', email: '', sujet: '', message: '' });
    } catch (error: any) {
      setErreur(error.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Contactez-nous</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Une question, un bug ou une demande de collaboration ? Remplissez le formulaire ci-dessous.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
          >
            <div>
              <label className="block text-sm font-semibold mb-1">Nom complet</label>
              <input
                type="text"
                name="nom"
                required
                value={form.nom}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Adresse email</label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Sujet</label>
              <input
                type="text"
                name="sujet"
                required
                value={form.sujet}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Envoyer'}
            </button>

            {envoye && (
              <p className="text-green-600 mt-2">Message envoyé avec succès ✅</p>
            )}
            {erreur && (
              <p className="text-red-600 mt-2">{erreur}</p>
            )}
          </form>

          <div className="w-full flex justify-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-md transition">
              <Image
                src="/images/contact.png"
                alt="Illustration contact"
                width={500}
                height={500}
                className="object-contain"
                priority
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
