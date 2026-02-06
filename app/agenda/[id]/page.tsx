import AgendaMedecin from "../../../components/Doctor/AgendaMedecin";

export default function Page({ params }: { params: { id: string } }) {
  return <AgendaMedecin medecinId={params.id} />;
}
