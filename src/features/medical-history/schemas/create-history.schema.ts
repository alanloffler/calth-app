import { z } from "zod";

export const createHistorySchema = z.object({
  businessId: z.uuid({ message: "El id de la empresa es obligatorio" }),
  comments: z
    .string()
    .refine((val) => val.replace(/<[^>]*>/g, "").trim().length >= 3, "Mínimo 3 caracteres")
    .refine((val) => val.replace(/<[^>]*>/g, "").trim().length <= 1000, "Máximo 1000 caracteres")
    .nonoptional(),
  date: z.date({ message: "La fecha es obligatoria" }),
  eventId: z.uuid({ message: "El id del usuario es obligatorio" }).nullish(),
  professionalId: z.uuid({ message: "El profesional es obligatorio" }).nonoptional(),
  reason: z
    .string()
    .nonempty("El motivo de consulta es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  recipe: z.boolean({ message: "La receta es obligatoria" }).nonoptional("La receta es obligatoria"),
  userId: z.uuid({ message: "El id del usuario es obligatorio" }).nonoptional("El id del usuario es obligatorio"),
});
