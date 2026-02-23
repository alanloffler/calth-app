import type { IMedicalHistory } from "@medical-history/interfaces/medical-history.interface";
import type { IPatientProfile } from "@users/interfaces/patient-profile.interface";
import type { IProfessionalProfile } from "@users/interfaces/professional-profile.interface";
import type { IRole } from "@roles/interfaces/role.interface";

export interface IUser {
  businessId: string;
  createdAt: string;
  deletedAt?: string;
  email: string;
  firstName: string;
  ic: string;
  id: string;
  lastName: string;
  medicalHistory?: IMedicalHistory[];
  password?: string;
  phoneNumber: string;
  patientProfile?: IPatientProfile;
  professionalProfile?: IProfessionalProfile;
  role: IRole;
  roleId: string;
  updatedAt: string;
  userName: string;
}
