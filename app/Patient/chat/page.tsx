import Navbar from "../../../components/Patient/Navbar";
import ChatClient from "../../../components/Patient/ChatClient";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Navbar />
      <ChatClient medecinId={params.id} />
    </>
  );
}
