import type { IProfessionalEvent } from "@calendar/interfaces/professional-event.interface";
import type { IUserEvent } from "@calendar/interfaces/user-event.interface";
import type { TEventStatus } from "@calendar/enums/event-status.enum";

export interface ICalendarEvent {
  createdAt: Date;
  endDate: Date;
  id: string;
  professional: IProfessionalEvent;
  professionalId: string;
  recurrentId: string;
  siblings: ICalendarEventShort[];
  startDate: Date;
  status: TEventStatus;
  title: string;
  user: IUserEvent;
  userId: string;
}

export interface ICalendarEventShort {
  endDate: Date;
  id: string;
  startDate: Date;
  status: TEventStatus;
}
