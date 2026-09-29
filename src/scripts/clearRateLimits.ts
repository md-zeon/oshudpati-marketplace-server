import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.$connect();
  const before = await prisma.rateLimit.count();
  const rows = await prisma.rateLimit.findMany({ select: { key: true, count: true } });
  console.log("existing buckets:", JSON.stringify(rows));
  const del = await prisma.rateLimit.deleteMany({
    where: {
      OR: [
        { key: { contains: "127.0.0.1" } },
        { key: { contains: "::1" } },
        { key: { startsWith: "test" } },
      ],
    },
  });
  const after = await prisma.rateLimit.count();
  console.log(`rows before: ${before} | removed: ${del.count} | rows after: ${after}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
