import { z } from "zod";

export const createContactSchema = z.object({
  email: z.email({ message: "Debes ingresar un email válido" }),
  phoneNumber: z
    .string()
    .nonempty("El número de teléfono es obligatorio")
    .length(10, "El número de teléfono debe tener 10 dígitos"),
  whatsAppNumber: z.string().length(10, "El número de WhatsApp debe tener 10 dígitos").or(z.literal("")).optional(),
  website: z.preprocess(
    (val) => (val === "" ? null : val),
    z.string().min(7, "El sitio web debe tener al menos 7 caracteres").max(50, "El sitio web debe tener como máximo 50 caracteres").nullable().optional(),
  ),
});
