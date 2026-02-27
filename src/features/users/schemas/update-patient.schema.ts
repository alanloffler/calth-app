import z from "zod";

import { userSchema } from "@users/schemas/users.schema";

export const updatePatientSchema = userSchema.extend({
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, "La contraseña debe tener al menos 8 caracteres"),
  gender: z
    .string()
    .nonempty("El género es obligatorio")
    .min(3, "El género debe tener al menos 3 caracteres")
    .max(20, "El género debe tener como máximo 20 caracteres"),
  birthDay: z
    .string()
    .nonempty("La fecha de nacimiento es obligatoria")
    .length(10, "La fecha de nacimiento debe tener 10 caracteres"),
  bloodType: z
    .string()
    .nonempty("El tipo de sangre es obligatorio")
    .min(3, "El tipo de sangre debe tener al menos 3 caracteres")
    .max(20, "El tipo de sangre debe tener como máximo 20 caracteres"),
  weight: z
    .string()
    .min(1, "El peso es obligatorio")
    .transform((val) => {
      const num = parseFloat(val.replace(/\s/g, "").replace(",", "."));
      if (isNaN(num)) throw new Error("El peso debe ser un número válido");
      return num;
    })
    .pipe(z.number().min(0.01, "El peso debe ser mayor a 0,00").max(999.99, "El peso debe ser menor a 999,99")),
  height: z
    .string()
    .nonempty("La altura es obligatoria")
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(30, "La altura mínima es 30 cms").max(300, "La altura máxima es 300 cms")),
  emergencyContactName: z
    .string()
    .nonempty("El nombre de contacto de emergencia es obligatorio")
    .min(3, "El nombre de contacto de emergencia debe tener al menos 3 caracteres")
    .max(50, "El nombre de contacto de emergencia debe tener como máximo 50 caracteres"),
  emergencyContactPhone: z
    .string()
    .nonempty("El teléfono de emergencia es obligatorio")
    .length(10, "El teléfono de emergencia debe tener 10 dígitos"),
});
