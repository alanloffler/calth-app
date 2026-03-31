import { z } from "zod";

export const createBusinessSchema = z.object({
  companyName: z
    .string()
    .nonempty("La razón social es obligatoria")
    .min(3, "La razón social debe tener al menos 3 caracteres")
    .max(50, "La razón social debe tener como máximo 50 caracteres"),
  taxId: z.string().nonempty("El CUIT no puede estar vacío").length(11, "El CUIT debe tener 11 dígitos"),
});
