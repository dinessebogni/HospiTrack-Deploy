import AgendaMedecin from "../../../components/Doctor/AgendaMedecin";

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  const medecinId = params.id;

  return <AgendaMedecin medecinId={medecinId} />;
}
