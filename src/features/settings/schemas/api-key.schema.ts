import z from "zod";

export const apiKeySchema = z.object({
  name: z
    .string()
    .nonempty("El proveedor no puede estar vacío")
    .min(3, "El proveedor debe tener al menos 3 caracteres"),
  key: z.string().nonempty("La clave no puede estar vacía"),
  linkedTo: z.string().min(2, "El enlace debe tener al menos 2 caracteres").optional(),
  active: z.boolean(),
});
