export type Role = "medecin" | "patient";

export interface Message {
  _id?: string;
  roomId: string;
  sender: Role;
  senderId?: string;
  receiverId?: string;
  content: string;
  timestamp: string;
}

export interface User {
  _id: string;
  nom: string;
  image?: string;
}
