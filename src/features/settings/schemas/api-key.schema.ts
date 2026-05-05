import z from "zod";

export const apiKeySchema = z.object({
  name: z.string().min(3, "El proveedor debe tener al menos 3 caracteres"),
  key: z.string().min(1, "La clave no puede estar vacía"),
  linkedTo: z.union([z.string().min(2, "El enlace debe tener al menos 2 caracteres"), z.literal("")]).optional(),
  active: z.boolean(),
});
