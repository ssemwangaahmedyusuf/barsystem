import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      username: "manager1",
      passwordHash: "placeholder",
      pin: "1234",
      firstName: "Beckham",
      lastName: "Baka",
      role: "MANAGER",
      isActive: true,
    },
  });
  console.log("Created user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
