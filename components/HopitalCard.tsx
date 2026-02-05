import Image from 'next/image';
import Link from 'next/link';

interface HopicardProps {
  id: string; 
  nom: string;
  ville: string;
  image?: string; 
}

export default function HospitalCard({ id, nom, ville, image }: HopicardProps) {
  const imageUrl = image
    ? `http://localhost:8000/uploads/${image}`
    : "/asset/hospital.png";

  return (
    <Link href={`/hopital/${id}`}> 
      <div className="border rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={nom}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{nom}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{ville}</p>
        </div>
      </div>
    </Link>
  );
}
