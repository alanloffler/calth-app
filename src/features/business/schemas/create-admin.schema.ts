import { z } from "zod";

export const createAdminSchema = z.object({
  email: z.email({ message: "Debes ingresar un email válido" }),
  firstName: z.string().nonempty("El nombre es obligatorio"),
  ic: z.string().nonempty("El número de DNI es obligatorio").max(8, "Máximo 8 dígitos").min(8, "Mínimo 8 dígitos"),
  lastName: z.string().nonempty("El apellido es obligatorio"),
  phoneNumber: z
    .string()
    .nonempty("El número de teléfono es obligatorio")
    .length(10, "El número de teléfono debe tener 10 dígitos"),
  userName: z
    .string()
    .min(2, "El nombre de usuario es obligatorio")
    .regex(/^@.{3,}$/, { message: "Mínimo 3 caracteres" }),
  password: z
    .string()
    .nonempty("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  roleId: z.uuid({ message: "El rol es obligatorio" }),
  businessId: z.uuid({ message: "El negocio es obligatorio" }),
});
