import prisma from "~~/lib/prisma";
import { z } from "zod";
import { requireAuth } from "~~/server/utils/auth";

const UpdateUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const userId = parseInt(event.context.params?.id || "");
  if (isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID",
    });
  }

  const body = await readBody(event);
  const validation = UpdateUserSchema.safeParse(body);

  if (!validation.success) {
    const messages = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(" | ");

    throw createError({
      statusCode: 400,
      statusMessage: messages,
    });
  }

  const data = validation.data;

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      updatedAt: true,
    },
  });

  return {
    user: updatedUser,
    message: "User updated successfully",
  };
});