import prisma from "~~/lib/prisma";
import { z } from "zod";
import { requireAuth } from "~~/server/utils/auth";

const UpdateCustomerSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.number().optional(),
  natioFixPourcent: z.number().optional(),
  natioMobPourcent: z.number().optional(),
  interFixPourcent: z.number().optional(),
  interMobPourcent: z.number().optional(),
  ddiPrice: z.number().optional(),
  subscriptions: z.array(z.object({
    definition: z.string(),
    price: z.number(),
  })).optional(),
  sipLine: z.array(z.object({
    descriptionName: z.string(),
  })).optional(),
  ddiName: z.array(z.object({
    descriptionName: z.string(),
  })).optional(),
});

export default defineEventHandler(async (event) => {
  requireAuth(event);

  const idParam = event.context.params?.id;
  const id = Number(idParam);

  if (!idParam || Number.isNaN(id)) {
    throw createError({ statusCode: 400, message: "Invalid id" });
  }

  const body = await readBody(event);
  const validation = UpdateCustomerSchema.safeParse(body);

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.error.issues.map(i => i.message).join(", "),
    });
  }

  const data = validation.data;

  try {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw createError({ statusCode: 404, message: "Customer not found" });
    }

    // Update customer and related data in transaction
    await prisma.$transaction(async (tx) => {
      // Update customer basic info
      await tx.customer.update({
        where: { id },
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          natioFixPourcent: data.natioFixPourcent,
          natioMobPourcent: data.natioMobPourcent,
          interFixPourcent: data.interFixPourcent,
          interMobPourcent: data.interMobPourcent,
          ddiPrice: data.ddiPrice,
        },
      });

      // Update subscriptions if provided
      if (data.subscriptions) {
        await tx.subscription.deleteMany({ where: { customerId: id } });
        if (data.subscriptions.length > 0) {
          await tx.subscription.createMany({
            data: data.subscriptions.map(sub => ({
              ...sub,
              customerId: id,
            })),
          });
        }
      }

      // Update SIP lines if provided
      if (data.sipLine) {
        await tx.sipLine.deleteMany({ where: { customerId: id } });
        if (data.sipLine.length > 0) {
          await tx.sipLine.createMany({
            data: data.sipLine.map(line => ({
              ...line,
              customerId: id,
            })),
          });
        }
      }

      // Update DDI names if provided
      if (data.ddiName) {
        await tx.ddiName.deleteMany({ where: { customerId: id } });
        if (data.ddiName.length > 0) {
          await tx.ddiName.createMany({
            data: data.ddiName.map(ddi => ({
              ...ddi,
              customerId: id,
            })),
          });
        }
      }
    });

    return { success: true, message: "Customer updated successfully" };
  } catch (err: any) {
    if (isError(err)) throw err;

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "An unexpected error occurred while updating the customer.",
    });
  }
});
