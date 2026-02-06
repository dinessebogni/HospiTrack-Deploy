// page.tsx
import AgendaMedecin from "../../../components/Doctor/AgendaMedecin";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <AgendaMedecin medecinId={params.id} />;
}
