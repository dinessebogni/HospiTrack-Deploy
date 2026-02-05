// types/rendezvous.ts
export type RDVStatus = 'en_attente' | 'confirme' | 'annule';

export interface Evenement {
  id?: string;            // peut être string | undefined avant persistance
  title: string;
  start: string;          // ISO
  end: string;            // ISO
  medecinId: string;      // requis côté back
  patientId?: string;     // défini automatiquement si patient
  status?: RDVStatus;     // renvoyé par l’API
  extendedProps?: {
    type?: string;
    visibilite?: string;
    notification?: boolean;
    notificationTime?: number;
  };
}
