import { Customers } from "@@/shared/types/Customer";
import prisma from "~~/lib/prisma";
import { Prisma } from "@prisma/client";

export default defineEventHandler(async (event) => {
  const {
    name,
    address,
    city,
    province,
    postalCode,
    natioMobPourcent,
    natioFixPourcent,
    interMobPourcent,
    interFixPourcent,
    ddiPrice,
    subscriptions,
    sipLine,
  } = await readBody<Customers>(event);

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { name },
    });

    if (existingCustomer) {
      throw createError({
        statusCode: 400,
        message: "Customer already registered",
      });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        address,
        city,
        province,
        postalCode,
        natioMobPourcent,
        natioFixPourcent,
        interMobPourcent,
        interFixPourcent,
        ddiPrice,
        subscriptions:
          subscriptions && subscriptions.length
            ? {
                create: subscriptions.map((s) => ({
                  definition: s.definition,
                  price: s.price,
                })),
              }
            : undefined,
        sipLine:
          sipLine && sipLine.length
            ? {
                create: sipLine.map((s) => ({
                  descriptionName: s.descriptionName,
                })),
              }
            : undefined,
      },
      include: {
        subscriptions: true,
        sipLine: true,
      },
    });

    setResponseStatus(event, 201);
    return {
      success: true,
      message: "Customer created",
      customer,
    };
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      //not unique customer
      if (err.code === "P2002") {
        throw createError({
          statusCode: 409,
          statusMessage: "Conflict",
          message: "Customer already exists",
          data: err.meta,
        });
      }
    }

    if (isError(err)) {
      //hand Nitro error
      throw err;
    }

    // Server error / unknow error
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "An unexpected error occurred while creating the customer.",
    });
  }
});
