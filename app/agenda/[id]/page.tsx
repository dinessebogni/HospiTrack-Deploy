import AgendaMedecin from "../../../components/Doctor/AgendaMedecin";

// Next.js App Router attend { params }
export default function Page({ params }: { params: { id: string } }) {
  // On force en string pour éviter le type number / string
  const medecinId = params.id;

  return <AgendaMedecin medecinId={medecinId} />;
}
