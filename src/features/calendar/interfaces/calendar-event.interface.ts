import type { IProfessionalEvent } from "@calendar/interfaces/professional-event.interface";
import type { IUserEvent } from "@calendar/interfaces/user-event.interface";
import type { TEventStatus } from "@calendar/enums/event-status.enum";

export interface ICalendarEvent {
  endDate: Date;
  id: string;
  professional: IProfessionalEvent;
  professionalId: string;
  startDate: Date;
  status: TEventStatus;
  title: string;
  user: IUserEvent;
  userId: string;
}
