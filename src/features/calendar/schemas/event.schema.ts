import z from "zod";

export const eventSchema = z
  .object({
    professionalId: z.uuid("El profesional es obligatorio").nonempty("El profesional es obligatorio"),
    startDate: z.string({ error: "La fecha es obligatoria" }).refine(
      (val) => {
        if (!val) return false;
        const date = new Date(val);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return hours !== 0 || minutes !== 0;
      },
      { message: "El horario es obligatorio" },
    ),
    title: z.string().nonempty("El título es obligatorio").min(3, "El título debe tener al menos 3 caracteres"),
    userId: z.uuid("El paciente es obligatorio").nonempty("El paciente es obligatorio"),
    recurringDates: z.array(z.string()).optional(),
    recurringCount: z.number().int().min(2).max(10).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.recurringCount === undefined) return;

    const available = data.recurringDates?.length ?? 0;
    if (available !== data.recurringCount) {
      ctx.addIssue({
        code: "custom",
        message: `Solo hay ${available} turnos recurrentes disponibles de los ${data.recurringCount} solicitados`,
        path: ["recurringDates"],
      });
    }
  });
