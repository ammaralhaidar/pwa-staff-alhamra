import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().optional(),
  password: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
