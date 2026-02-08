import { z } from "zod";

export const createHistorySchema = z.object({
  businessId: z
    .uuidv4({ message: "El id de la empresa es obligatorio" })
    .nonoptional("El id del negocio es obligatorio"),
  comments: z.string().min(3, "Mínimo 3 caracteres").max(1000, "Máximo 1000 caracteres").nonoptional(),
  date: z.date({ message: "La fecha es obligatoria" }),
  eventId: z.uuidv4({ message: "El id del usuario es obligatorio" }).nullish(),
  reason: z
    .string()
    .nonempty("El motivo de consulta es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .max(100, "Máximo 100 caracteres"),
  recipe: z.boolean({ message: "La receta es obligatoria" }).nonoptional("La receta es obligatoria"),
  userId: z.uuidv4({ message: "El id del usuario es obligatorio" }).nonoptional("El id del usuario es obligatorio"),
});
