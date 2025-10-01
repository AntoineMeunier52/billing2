import prisma from "~~/lib/prisma";
import { z } from "zod";
import { requireAuth } from "~~/server/utils/auth";
import { sendEmail, generateActivationEmail } from "~~/server/utils/email";
import crypto from "crypto";

const CreateUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const body = await readBody(event);
  const validation = CreateUserSchema.safeParse(body);

  if (!validation.success) {
    const messages = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" | ");

    throw createError({
      statusCode: 400,
      statusMessage: messages,
    });
  }

  const { email, name } = validation.data;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: "User with this email already exists",
    });
  }

  // Generate activation token with 24h expiry
  const activationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Create user without password - will be set during activation
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      role: "ADMIN",
      password: "", // Empty password, will be set during activation
      resetToken: `${activationToken}:${tokenExpiry.getTime()}`, // Token with expiry
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Send activation email
  console.log("send email");
  const emailContent = generateActivationEmail(name, email, activationToken);
  await sendEmail({
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
  });

  return {
    user: newUser,
    message: "User created successfully. Activation email sent.",
  };
});
