import prisma from "~~/lib/prisma";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const authPayload = requireAuth(event);

  const user = await prisma.user.findUnique({
    where: { id: authPayload.userId },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found"
    });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
});
