'use client';

import React from 'react';
import { FaCalendarAlt, FaUserMd, FaClock, FaMoon } from 'react-icons/fa';
import Navbar from '../../components/Patient/Navbar';

export default function AProposPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12 text-gray-800 dark:text-gray-100 space-y-16">

        {/* Header Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold">À propos de HospiTrack</h1>
          <p className="text-lg max-w-3xl mx-auto">
            HospiTrack est une plateforme moderne de téléconsultation et de gestion hospitalière en temps réel,
            permettant la planification des rendez-vous, la consultation des disponibilités médicales et l'amélioration de la coordination entre médecins et patients.
          </p>
        </section>

        {/* Fonctionnalités */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">Fonctionnalités principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex items-start space-x-4">
              <FaCalendarAlt className="text-3xl text-primary mt-1" />
              <div>
                <h3 className="text-xl font-bold">Gestion d’agenda</h3>
                <p>Planifiez et visualisez les consultations en temps réel, avec une gestion facile des créneaux disponibles pour chaque médecin.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaUserMd className="text-3xl text-primary mt-1" />
              <div>
                <h3 className="text-xl font-bold">Consultation des disponibilités</h3>
                <p>Accédez rapidement aux disponibilités des médecins selon leurs services, spécialités et horaires pour mieux organiser vos rendez-vous.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaClock className="text-3xl text-primary mt-1" />
              <div>
                <h3 className="text-xl font-bold">Création d’événements</h3>
                <p>Créez et gérez vos événements médicaux, rendez-vous et sessions de téléconsultation avec des permissions adaptées.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaMoon className="text-3xl text-primary mt-1" />
              <div>
                <h3 className="text-xl font-bold">Interface moderne</h3>
                <p>Profitez d’une interface épurée et responsive, compatible avec le mode sombre et clair pour un confort optimal.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Objectif */}
        <section>
          <h2 className="text-3xl font-semibold mb-4">Notre objectif</h2>
          <p className="text-lg leading-relaxed max-w-3xl">
            Fournir aux hôpitaux et cliniques une solution intuitive, sécurisée et performante pour gérer le personnel médical,
            coordonner les rendez-vous et offrir aux patients une expérience de téléconsultation fluide et efficace.
          </p>
        </section>
      </main>
    </>
  );
}
