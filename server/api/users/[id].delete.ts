import prisma from "~~/lib/prisma";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  const authUser = requireAuth(event);

  const userId = parseInt(event.context.params?.id || "");
  if (isNaN(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid user ID",
    });
  }

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

  // Prevent deleting yourself
  if (targetUser.id === authUser.userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "You cannot delete your own account",
    });
  }

  // Delete user
  await prisma.user.delete({
    where: { id: userId },
  });

  return {
    message: "User deleted successfully",
  };
});