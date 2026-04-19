import type { IPermission } from "@permissions/interfaces/permission.interface";
import type { IUser } from "@users/interfaces/user.interface";

export interface IRole {
  admins: Pick<IUser, "id" | "firstName" | "lastName" | "role" | "userName">[];
  createdAt: string;
  deletedAt?: string;
  description: string;
  id: string;
  name: string;
  rolePermissions?: IRolePermissions[];
  users: Pick<IUser, "id" | "firstName" | "lastName" | "role" | "userName">[];
  value: string;
}

export interface IRolePermissions {
  permission: IPermission | null;
  permissionId: string;
  roleId: string;
}
