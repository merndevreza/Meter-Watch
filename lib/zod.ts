import { z } from "zod"

export const signInSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email"),
  password: z.string()
    .min(1, "Password is required")
    .min(4, "Password must be more than 4 characters")
    .max(32, "Password must be less than 32 characters"),
})