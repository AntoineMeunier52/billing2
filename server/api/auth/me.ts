import * as jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader) {
    throw createError({ statusCode: 401, message: "No token Provided" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId =
      typeof decoded === "object" && decoded !== null && "userId" in decoded
        ? (decoded as jwt.JwtPayload).userId
        : undefined;

    if (!userId) {
      throw createError({ statusCode: 401, message: "Invalid token payload" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch {
    throw createError({ statusCode: 401, message: "Invalid token" });
  }
});
