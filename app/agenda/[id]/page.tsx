// app/Doctor/agenda/[id]/page.tsx
import AgendaMedecin from '../../../components/Doctor/AgendaMedecin';

type PageProps = {
  params: { id: string };
};

export default function Page({ params }: PageProps) {
  const medecinId = parseInt(params.id, 10); // convertir id string en number
  return <AgendaMedecin medecinId={medecinId} />;
}
