import { prisma } from "@/shared/database/prisma";
import { hash } from "bcryptjs";

async function main() {
  const passwordHash = await hash("123456", 8);

  const user = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@email.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  console.log(user);
}

main();