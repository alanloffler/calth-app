import z from "zod";

import { userSchema } from "@users/schemas/users.schema";

export const updateAdminSchema = userSchema.extend({
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, "La contraseña debe tener al menos 8 caracteres"),
});
