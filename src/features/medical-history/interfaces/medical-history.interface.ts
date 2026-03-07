import type { IUser } from "@users/interfaces/user.interface";

export interface IMedicalHistory extends IMedicalHistoryCreate {
  createdAt: Date;
  deletedAt: Date;
  id: string;
  professional: IUser;
  updatedAt: Date;
  user: IUser;
}

export interface IMedicalHistoryCreate {
  businessId: string;
  comments: string;
  date: Date;
  eventId?: string | null;
  professionalId: string;
  reason: string;
  recipe: boolean;
  userId: string;
}
