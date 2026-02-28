import z from "zod";

import { userSchema } from "@users/schemas/users.schema";

export const createAdminSchema = userSchema.extend({
  password: z
    .string()
    .nonempty("La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});
