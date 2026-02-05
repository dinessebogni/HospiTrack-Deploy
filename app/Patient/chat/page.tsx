'use client';

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import Navbar from "../../../components/Patient/Navbar";
// import SidebarPatient from "../../components/Patient/SidebarPatient";

interface Message {
  sender: "medecin" | "patient";
  content: string;
  timestamp: string;
}

interface ChatPageProps {
  medecinId: string;
}

export default function ChatPage({ medecinId }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Récupérer l’historique des messages
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`http://localhost:8000/api/messages/${medecinId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: Message[]) => setMessages(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [medecinId]);

  // Connexion Socket.IO
  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    // Rejoindre la room unique patient-medecin
    socketRef.current.emit("join-room", medecinId);

    // Écouter les messages entrants
    socketRef.current.on("receive-message", (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [medecinId]);

  // Envoyer un message
  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;

    const msg: Message = {
      sender: "patient",
      content: input,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("send-message", medecinId, msg);
    setMessages(prev => [...prev, msg]);
    setInput("");
  };

  // Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) return <p>Chargement...</p>;

  return (
    <>
    <Navbar />
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <main className="flex-1 p-6 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Messagerie avec le médecin</h1>
  
          <div className="flex-1 overflow-y-auto p-4 border rounded-lg bg-white dark:bg-gray-800 flex flex-col gap-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-2 rounded max-w-[60%] ${
                  m.sender === "patient"
                    ? "bg-green-500 text-white self-end"
                    : "bg-gray-300 text-gray-900 self-start"
                }`}
              >
                {m.content}
                <div className="text-xs text-gray-200 mt-1">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
  
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Écrire un message..."
              className="flex-1 px-4 py-2 rounded border dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} className="px-4 py-2 bg-green-600 text-white rounded">
              Envoyer
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
