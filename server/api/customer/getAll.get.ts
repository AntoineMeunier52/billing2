import prisma from "~~/lib/prisma";
import { requireAuth } from "~~/server/utils/auth";

export default defineEventHandler(async (event) => {
  requireAuth(event);
  try {
    const customers = await prisma.customer.findMany({
      include: {
        subscriptions: true,
        sipLine: true,
        ddiName: true,
      },
    });

    return {
      success: true,
      message: "Customers found",
      customers,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "An error occurred while fetching customers",
      customers: [],
    };
  }
});
