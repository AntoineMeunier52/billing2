import prisma from "~~/lib/prisma";
import { z } from "zod";
import { hashPassword, generateToken } from "~~/server/utils/auth";

const ActivateAccountSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = ActivateAccountSchema.safeParse(body);

  if (!validation.success) {
    const messages = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" | ");

    throw createError({
      statusCode: 400,
      statusMessage: messages,
    });
  }

  const { token, password } = validation.data;

  // Find user with this activation token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      password: "", // User not yet activated
    },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid activation token or account already activated",
    });
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update password and clear activation token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
    },
  });

  // Generate JWT for auto-login
  const jwtToken = generateToken({ userId: user.id, email: user.email });

  return {
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    message: "Account activated successfully. You are now logged in.",
  };
});