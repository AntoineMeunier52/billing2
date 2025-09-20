import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { firstName, lastName, email, password } = await readBody(event);

  const validatorResponse = await validatorSignup.safeParseAsync({
    firstName,
    lastName,
    email,
    password,
  });

  if (!validatorResponse.error) {
    throw createError({
      statusCode: 400,
      message: validatorResponse.error,
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string, //32 bytes key
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  } catch (error: any) {
    if (error.code === "P2002") {
      throw createError({
        statusCode: 400,
        message: "Email already registered",
      });
    }
    throw error;
  }
});
