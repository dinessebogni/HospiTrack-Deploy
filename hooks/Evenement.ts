export interface Evenement {
  id: string;
  title: string;
  start: string | Date;
  end: string | Date;
  extendedProps?: {
    type?: string;
    visibilite?: string;
    notification?: boolean;
    notificationTime?: number;
  };
}
