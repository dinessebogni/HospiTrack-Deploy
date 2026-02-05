import Image from 'next/image';

interface DoctorCardProps {
  name: string;
  specialty: string;
  status: 'Disponible' | 'Indisponible';
  avatar: string;
}

const DoctorCard = ({ name, specialty, status, avatar }: DoctorCardProps) => {
  const isAvailable = status === 'Disponible';

  return (
    <div className="flex items-center space-x-3 p-4 rounded-xl shadow-sm border w-64 bg-white dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
          <Image src={avatar} alt={name} width={56} height={56} />
        </div>
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">{name}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-300">{specialty}</p>
        <div className="flex items-center mt-1">
          <span
            className={`w-2.5 h-2.5 rounded-full mr-1.5 ${
              isAvailable ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></span>
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">{status}</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
