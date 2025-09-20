import * as jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@@/lib/prisma";
import z from "zod";

//schema validation
const UserValidator = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password too short, minimum length 8"),
});

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  const validatorResponse = await UserValidator.safeParseAsync({
    email,
    password,
  });

  console.log(validatorResponse.error);
  if (!validatorResponse.success) {
    const messages = validatorResponse.error.issues
      .map((i) => `${i.path.join(".") || "form"}: ${i.message}`)
      .join(" | ");

    throw createError({
      statusCode: 400,
      message: messages,
    });
  }

  if (
    !user ||
    !user.password ||
    !(await bcrypt.compare(password, user.password))
  ) {
    throw createError({
      statusCode: 401,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
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
});
