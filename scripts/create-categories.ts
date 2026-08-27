import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const categories = await prisma.category.createMany({
    data: [
      { name: "Beer" },
      { name: "Spirits" },
      { name: "Soft Drinks" },
      { name: "Wine" },
    ],
  });
  console.log("Created categories:", categories);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
