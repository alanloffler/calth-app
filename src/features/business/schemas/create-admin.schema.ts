import { z } from "zod";

export const createAdminSchema = z.object({
  adminEmail: z.email("El correo electrónico no es válido"),
});
