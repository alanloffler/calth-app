import type { TUserRole } from "@roles/interfaces/user-role.type";

export const ERolePlural: Partial<Record<TUserRole, string>> = {
  admin: "administradores",
  patient: "pacientes",
  professional: "profesionales",
} as const;
