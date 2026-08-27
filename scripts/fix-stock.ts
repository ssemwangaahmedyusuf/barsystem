import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.product.updateMany({
    where: { name: "Nile special" },
    data: { currentStock: 50 },
  });
  console.log("Set stock:", result);

  const product = await prisma.product.findFirst({
    where: { name: "Nile special" },
  });
  console.log("Current state:", product);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
