import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const tables = await prisma.barTable.createMany({
    data: [
      { name: "Table 1", capacity: 4 },
      { name: "Table 2", capacity: 4 },
      { name: "Table 3", capacity: 6 },
      { name: "Table 4", capacity: 2 },
    ],
  });
  console.log("Created tables:", tables);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
