import type { IUser } from "@users/interfaces/user.interface";

export interface IMedicalHistory extends IMedicalHistoryCreate {
  createdAt: Date;
  deletedAt: Date;
  id: string;
  updatedAt: Date;
  user: IUser;
  professional: IUser;
}

export interface IMedicalHistoryCreate {
  businessId: string;
  comments: string;
  date: Date;
  eventId?: string | null;
  reason: string;
  recipe: boolean;
  userId: string;
}
