const API_BASE = "http://localhost:8000/api";

interface Room {
  _id: string;
  patientId: string;
  medecinId: string;
}

export async function getOrCreateRoom(patientId: string, medecinId: string): Promise<Room | null> {
  try {
    const res = await fetch(`${API_BASE}/room`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, medecinId }),
    });

    if (!res.ok) {
      console.error("Erreur lors de la création ou récupération de la room");
      return null;
    }

    const room: Room = await res.json();
    return room;
  } catch (err) {
    console.error("Erreur fetch getOrCreateRoom:", err);
    return null;
  }
}
