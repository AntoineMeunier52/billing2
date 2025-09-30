import prisma from "~~/lib/prisma";
import { z } from "zod";
import { hashPassword } from "~~/server/utils/auth";

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = ResetPasswordSchema.safeParse(body);

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

  // Find user with this token
  const users = await prisma.user.findMany();
  let user = null;

  for (const u of users) {
    if (!u.resetToken) continue;

    const [storedToken, expiryStr] = u.resetToken.split(":");
    const expiry = parseInt(expiryStr, 10);

    // Check if token matches and hasn't expired
    if (storedToken === token && Date.now() < expiry) {
      user = u;
      break;
    }
  }

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired reset token",
    });
  }

  // Hash new password
  const hashedPassword = await hashPassword(password);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
    },
  });

  return {
    message: "Password reset successfully. You can now log in with your new password.",
  };
});