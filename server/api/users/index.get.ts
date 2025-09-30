import prisma from "~~/lib/prisma";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { users };
});