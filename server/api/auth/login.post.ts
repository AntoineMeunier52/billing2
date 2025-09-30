import prisma from "~~/lib/prisma";
import { z } from "zod";
import { verifyPassword, generateToken } from "~~/server/utils/auth";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const validation = LoginSchema.safeParse(body);
  if (!validation.success) {
    const messages = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" | ");

    throw createError({
      statusCode: 400,
      statusMessage: messages,
    });
  }

  const { email, password } = validation.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password || !(await verifyPassword(password, user.password))) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  const token = generateToken({ userId: user.id, email: user.email });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
});
