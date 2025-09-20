import z from "zod";

export const validatorSignup = z.object({
  firstName: z
    .string()
    .min(2, "First Name too short, minimum length is 2")
    .max(191, "First Name too long, maximum length is 191"),
  lastName: z
    .string()
    .min(2, "Last Name too short, minimum length is 2")
    .max(191, "Last Name too long, maximum length is 191"),
  email: z.string().email(),
  password: z.string().min(8, "Password too short, minimum length 8"),
});
