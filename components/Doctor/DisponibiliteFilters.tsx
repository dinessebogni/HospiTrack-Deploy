import React from "react";
import SelectService from "../../components/SelectService";
import SelectSpecialite from "../../components/SelectSpecialite";
import SelectHopital from "../../components/SelectHopital";

interface DisponibiliteFiltersProps {
  currentService: string;
  currentSpecialite: string;
  currentTranche: string;
  currentHopital: string;
  onServiceChange: (service: string) => void;
  onSpecialiteChange: (specialite: string) => void;
  onTrancheChange: (tranche: string) => void;
  onHopitalChange: (hopital: string) => void;
}

export default function DisponibiliteFilters({
  currentService,
  currentSpecialite,
  currentTranche,
  currentHopital,
  onServiceChange,
  onSpecialiteChange,
  onTrancheChange,
  onHopitalChange,
}: DisponibiliteFiltersProps) {
  return (
    <div className="text-gray-900 dark:text-white grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Service */}
      <SelectService
        current={currentService}
        onChange={onServiceChange}
      />

      {/* Spécialité */}
      <SelectSpecialite
        current={currentSpecialite}
        onChange={onSpecialiteChange}
      />

      {/* Tranche horaire */}
      <select
        value={currentTranche}
        onChange={(e) => onTrancheChange(e.target.value)}
        className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-sm shadow-sm"
      >
        <option value="">Toutes les tranches horaires</option>
        <option value="Matin">Matin</option>
        <option value="Après-midi">Après-midi</option>
        <option value="Soir">Soir</option>
      </select>

      {/* Hôpital */}
      <SelectHopital
        current={currentHopital}
        onChange={onHopitalChange}
      />
    </div>
  );
}
