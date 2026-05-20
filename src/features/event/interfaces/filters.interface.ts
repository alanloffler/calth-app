export interface IEventFilters {
  date?: Date;
  needsReschedule?: boolean;
  patientId?: string;
  professionalId?: string;
  recurrent?: boolean;
  status?: string;
}
