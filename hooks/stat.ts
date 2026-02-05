export interface Appointment {
  _id: string;              
  title: string;             
  start: string;               
  end: string;                 
  status: "en_attente" | "confirme" | "annule"; 
  patientId?: string;          
  medecinId?: string;          
  type?: string;  
  service?: string;              
  visibilite?: string;        
  notification?: boolean;      
  notificationTime?: string;   
  createdBy?: "patient" | "medecin" | "admin"; 
}
