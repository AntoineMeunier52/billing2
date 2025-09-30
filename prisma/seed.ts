import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if any users exist
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log("No users found. Creating superadmin...");

    const hashedPassword = await bcrypt.hash("SuperAdmin123!", 10);

    const superadmin = await prisma.user.create({
      data: {
        email: "admin@billing.local",
        password: hashedPassword,
        name: "Super Admin",
        role: "SUPERADMIN",
      },
    });

    console.log("✅ Superadmin created:");
    console.log("   Email: admin@billing.local");
    console.log("   Password: SuperAdmin123!");
    console.log("   Role: SUPERADMIN");
    console.log("\n⚠️  Please change the password after first login!");
  } else {
    console.log(`Database already has ${userCount} user(s). Skipping seed.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });