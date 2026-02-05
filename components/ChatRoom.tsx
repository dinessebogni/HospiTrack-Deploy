"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSocket } from "../utils/socket"; // Socket singleton

interface User {
  _id: string;
  nom: string;
  role: "patient" | "medecin";
}

interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  readBy?: string[];
}

interface ChatRoomProps {
  currentUser: User;
  otherUserId: string;
}

interface Room {
  _id: string;
}

const API_BASE = "http://localhost:8000/api";

export default function ChatRoom({ currentUser, otherUserId }: ChatRoomProps) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  // --- Création ou récupération de la room ---
  useEffect(() => {
    if (!currentUser || !otherUserId) return;

    const createRoom = async () => {
      try {
        const patientId = currentUser.role === "patient" ? currentUser._id : otherUserId;
        const medecinId = currentUser.role === "medecin" ? currentUser._id : otherUserId;

        const res = await fetch(`${API_BASE}/chat/room`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId, medecinId }),
        });

        if (!res.ok) throw new Error(`Erreur ${res.status}`);

        const room: Room = await res.json();
        setRoomId(room._id);

        // Rejoindre la room côté socket
        socket.emit("joinRoom", room._id);
      } catch (err) {
        console.error("❌ Erreur création room :", err);
      }
    };

    createRoom();
  }, [currentUser, otherUserId, socket]);

  // --- Charger l’historique et écouter messages ---
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API_BASE}/chat/messages/${roomId}`);
        if (!res.ok) throw new Error(`Erreur ${res.status}`);
        const data: Message[] = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Erreur récupération messages :", err);
        setMessages([]);
      }
    };
    fetchMessages();

    // --- Gestion des messages entrants ---
    const handleReceiveMessage = (msg: Message) => {
      if (msg.roomId !== roomId) return;
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    const handleUserTyping = ({ userName }: { userName: string }) => {
      if (userName !== currentUser.nom) setTypingUser(userName);
      setTimeout(() => setTypingUser(null), 2000);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.emit("leaveRoom", roomId);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
    };
  }, [roomId, currentUser.nom, socket]);

  // --- Envoyer un message ---
  const sendMessage = () => {
    if (!text.trim() || !roomId) return;

    const msg: Omit<Message, "_id"> = {
      roomId,
      senderId: currentUser._id,
      senderName: currentUser.nom,
      message: text,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI
    setMessages(prev => [...prev, { ...msg, _id: Date.now().toString() }]);

    socket.emit("sendMessage", msg);
    setText("");
  };

  // --- Indicateur typing ---
  const handleTyping = () => {
    if (!roomId) return;
    socket.emit("typing", { roomId, userName: currentUser.nom });
  };

  // --- Scroll automatique ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!roomId) return <div>Création de la conversation...</div>;

  return (
    <div className="h-full flex flex-col p-4 border rounded bg-white">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map(m => (
          <div
            key={m._id}
            className={`mb-2 p-2 rounded max-w-xs break-words ${
              m.senderId === currentUser._id ? "bg-blue-200 self-end" : "bg-gray-200 self-start"
            }`}
          >
            <b>{m.senderName}</b>: {m.message}
          </div>
        ))}
        {typingUser && (
          <div className="text-sm text-gray-500">{typingUser} est en train d'écrire...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            handleTyping();
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Écrire un message..."
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-1 bg-blue-500 text-white rounded"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}
