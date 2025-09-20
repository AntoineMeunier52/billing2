import * as jwt from "jsonwebtoken";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const authHeader = getHeader(event, "authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      throw createError({
        statusCode: 401,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId =
      typeof decoded === "object" && decoded !== null && "userId" in decoded
        ? (decoded as jwt.JwtPayload).userId
        : undefined;

    if (!userId) {
      throw createError({
        statusCode: 401,
        message: "Invalid token payload",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Logout error:", error);
    throw createError({
      statusCode: 500,
      message: "Error during logout",
    });
  }
});
