import AgendaMedecin from "../../../components/Doctor/AgendaMedecin";

// Toujours recevoir { params } de Next.js
interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  // Force le type string pour éviter toute erreur TS
  const medecinId = String(params.id);

  return <AgendaMedecin medecinId={medecinId} />;
}
