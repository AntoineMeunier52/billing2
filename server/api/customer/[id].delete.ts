import prisma from "~~/lib/prisma";
import { Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const idParam = event.context.params?.id;
  const id = Number(idParam);

  if (!idParam || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: "Invalid id" });
  }

  try {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw createError({ statusCode: 404, message: "Customer not found" });
    }

    await prisma.$transaction([
      prisma.subscription.deleteMany({ where: { customerId: id } }),
      prisma.sipLine.deleteMany({ where: { customerId: id } }),
      prisma.ddiName.deleteMany({ where: { customerId: id } }),
      prisma.customer.delete({ where: { id } }),
    ]);

    return {
      success: true,
      message: "Customer deleted",
    };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found (concurrence)
      if (err.code === "P2025") {
        throw createError({
          statusCode: 404,
          statusMessage: "Not Found",
          message: "Customer not found",
        });
      }
    }

    if (isError(err)) throw err;

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "An unexpected error occurred while deleting the customer.",
    });
  }
});
