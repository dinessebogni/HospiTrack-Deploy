import { FaCity } from 'react-icons/fa';

interface Props {
  current: string; 
  onChange: (ville: string) => void;
  hopitaux: { ville: string }[];
}

export default function SelectVille({ current, onChange, hopitaux }: Props) {
  const villes = Array.from(new Set(hopitaux.map(h => h.ville)));

  return (
    <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-xs">
      {/* Icône */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FaCity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
      </div>
    
      {/* Select */}
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 text-sm shadow-sm"
      >
        <option value="">Toutes les villes</option>
        {villes.map((v) => (
          <option key={v} value={v}>
            {v}
          </option> 
        ))}
      </select>
    </div>
  );
}
