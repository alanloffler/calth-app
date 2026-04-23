import z from "zod";

export const eventSchema = z
  .object({
    professionalId: z.uuid("El profesional es obligatorio").nonempty("El profesional es obligatorio"),
    startDate: z.string(),
    title: z.string().nonempty("El título es obligatorio").min(3, "El título debe tener al menos 3 caracteres"),
    userId: z.uuid("El paciente es obligatorio").nonempty("El paciente es obligatorio"),
    recurringDates: z.array(z.string()).optional(),
    recurringCount: z.number().int().min(2).max(10).optional(),
  })
  .refine(
    (data) => data.startDate && data.startDate !== "",
    { message: "Fecha obligatoria", path: ["startDate"] },
  )
  .refine(
    (data) => {
      if (!data.startDate || data.startDate === "") return true;
      const date = new Date(data.startDate);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return hours !== 0 || minutes !== 0;
    },
    { message: "Horario obligatorio", path: ["startDate"] },
  )
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
