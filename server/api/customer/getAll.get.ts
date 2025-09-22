import prisma from "~~/lib/prisma";

export default defineEventHandler(async () => {
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
