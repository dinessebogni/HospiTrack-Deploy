import dynamic from 'next/dynamic';

// On charge le composant uniquement côté client
const ClientRendezVous = dynamic(() => import('../../../components/Doctor/ClientRendezVous'), { ssr: false });

export default function Page() {
  return <ClientRendezVous />;
}
