import { z } from "zod";

export const profileSchema = z.object({
  email: z.email({ message: "Debes ingresar un email válido" }),
  firstName: z.string().nonempty("El nombre es obligatorio"),
  ic: z.string().nonempty("El número de DNI es obligatorio").max(8, "Máximo 8 dígitos").min(8, "Mínimo 8 dígitos"),
  lastName: z.string().nonempty("El apellido es obligatorio"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, "La contraseña debe tener al menos 8 caracteres"),
  phoneNumber: z
    .string()
    .nonempty("El número de teléfono es obligatorio")
    .length(10, "El número de teléfono debe tener 10 dígitos"),
  userName: z
    .string()
    .min(2, "El nombre de usuario es obligatorio")
    .regex(/^@.{3,}$/, { message: "Mínimo 3 caracteres" }),
});
