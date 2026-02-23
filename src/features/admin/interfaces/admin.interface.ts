import type { IRole } from "@roles/interfaces/role.interface";

export interface IAdmin {
  businessId: string;
  createdAt: string;
  deletedAt?: string;
  email: string;
  firstName: string;
  ic: string;
  id: string;
  lastName: string;
  password: string;
  phoneNumber: string;
  role: IRole;
  roleId: string;
  updatedAt: string;
  userName: string;
}
