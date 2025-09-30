import prisma from "~~/lib/prisma";
import { z } from "zod";
import { sendEmail, generatePasswordResetEmail } from "~~/server/utils/email";
import crypto from "crypto";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validation = ForgotPasswordSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid email address",
    });
  }

  const { email } = validation.data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Don't reveal if user exists or not for security
  if (!user) {
    return {
      message: "If an account exists with this email, a reset link has been sent.",
    };
  }

  // Generate reset token (valid for 1 hour)
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token in database (we'll store it as "token:expiry")
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: `${resetToken}:${resetTokenExpiry.getTime()}`,
    },
  });

  // Send email
  const emailContent = generatePasswordResetEmail(user.name, user.email, resetToken);
  await sendEmail({
    to: user.email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  return {
    message: "If an account exists with this email, a reset link has been sent.",
  };
});