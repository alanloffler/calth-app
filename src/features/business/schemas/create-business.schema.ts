import { z } from "zod";

export const createBusinessSchema = z.object({
  // Comercial
  companyName: z
    .string()
    .nonempty("La razón social es obligatoria")
    .min(3, "La razón social debe tener al menos 3 caracteres")
    .max(50, "La razón social debe tener como máximo 50 caracteres"),
  taxId: z.string().nonempty("El CUIT no puede estar vacío").length(11, "El CUIT debe tener 11 dígitos"),
  tradeName: z
    .string()
    .nonempty("El nombre comercial es obligatorio")
    .min(3, "El nombre comercial debe tener al menos 3 caracteres")
    .max(50, "El nombre comercial debe tener como máximo 50 caracteres"),
  description: z
    .string()
    .nonempty("La descripción es obligatoria")
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(200, "La descripción debe tener como máximo 200 caracteres"),
  // Address
  street: z
    .string()
    .nonempty("La calle es obligatoria")
    .min(3, "La calle debe tener al menos 3 caracteres")
    .max(50, "La calle debe tener como máximo 50 caracteres"),
  city: z
    .string()
    .nonempty("La ciudad es obligatoria")
    .min(3, "La ciudad debe tener al menos 3 caracteres")
    .max(50, "La ciudad debe tener menos de 50 caracteres"),
  province: z
    .string()
    .nonempty("La provincia es obligatoria")
    .min(3, "La provincia debe tener al menos 3 caracteres")
    .max(50, "La provincia debe tener como máximo 50 caracteres"),
  country: z
    .string()
    .nonempty("El país es obligatorio")
    .min(3, "El país debe tener al menos 3 caracteres")
    .max(50, "El país debe tener como máximo 50 caracteres"),
  zipCode: z
    .string()
    .nonempty("El código postal es obligatorio")
    .min(4, "El código postal debe tener al 4 dígitos")
    .max(6, "El código postal debe tener como máximo 6 dígitos"),
});
