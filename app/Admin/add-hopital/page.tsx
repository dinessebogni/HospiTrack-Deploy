// app/create-hopital/page.tsx
'use client';

import React from "react";
import Navbar from "../../../components/Patient/Navbar";
import CreateHopitalForm from "../../../components/Admin/CreateHospitalForm"; 

export default function CreateHopitalPage() {
  return (
    <>
      <Navbar />

      <div className="dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300 min-h-screen py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">
              Ajouter votre hôpital
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Remplissez le formulaire ci-dessous pour rendre votre établissement visible et permettre la prise de rendez-vous en ligne.
            </p>
          </div>

          {/* Formulaire */}
          <CreateHopitalForm />
        </div>
      </div>
    </>
  );
}
