import { z } from "zod";

export const AuthSchema = z.object({
  email: z.string().email("Invalid email have the correct email asswhole"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AuthSchemaType = z.infer<typeof AuthSchema>;
