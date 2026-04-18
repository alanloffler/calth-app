import { z } from "zod";

export const blockedDaysSchema = z.object({
  date: z.date("La fecha es obligatoria"),
  professionalId: z.uuid().nonempty("El ID del profesional es obligatorio"),
  reason: z.string().nonempty("El motivo es obligatorio").min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
  recurrent: z.boolean().optional(),
});
