import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  isExemptFromLimiting,
  resolveTier,
  TIER_POLICIES,
} from "../config/rateLimit.config";

interface BucketRow {
  count: number;
  resetAt: Date;
}

async function consume(key: string, windowMs: number): Promise<BucketRow> {
  const rows = await prisma.$queryRaw<BucketRow[]>`
    INSERT INTO "rate_limit" ("key", "count", "resetAt", "createdAt", "updatedAt")
    VALUES (${key}, 1, ${new Date(Date.now() + windowMs)}, NOW(), NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count"     = CASE WHEN "rate_limit"."resetAt" <= NOW() THEN 1 ELSE "rate_limit"."count" + 1 END,
      "resetAt"   = CASE WHEN "rate_limit"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "rate_limit"."resetAt" END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `;
  return rows[0];
}

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean): void {
  console.log(`${condition ? "PASS" : "FAIL"}  ${name}`);
  condition ? passed++ : failed++;
}

async function main() {
  await prisma.$connect();
  const run = Date.now();
  const readWindow = TIER_POLICIES.read.windowMs;

  console.log("--- counter increments monotonically ---");
  const key = `verify:${run}`;
  const counts: number[] = [];
  for (let i = 0; i < 5; i++) counts.push((await consume(key, readWindow)).count);
  check("counts are 1,2,3,4,5", JSON.stringify(counts) === "[1,2,3,4,5]");

  console.log("--- concurrent burst loses no increments ---");
  const burstKey = `verify-burst:${run}`;
  const burst = await Promise.all(
    Array.from({ length: 25 }, () => consume(burstKey, readWindow)),
  );
  const sorted = burst.map((b) => b.count).sort((a, b) => a - b);
  check(
    "25 concurrent writes form an exact 1..25 run",
    JSON.stringify(sorted) ===
      JSON.stringify(Array.from({ length: 25 }, (_, i) => i + 1)),
  );

  console.log("--- expired window resets ---");
  const expiringKey = `verify-exp:${run}`;
  await consume(expiringKey, -1000);
  const afterExpiry = await consume(expiringKey, readWindow);
  check(`expired bucket resets to 1 (got ${afterExpiry.count})`, afterExpiry.count === 1);

  console.log("--- tier resolution ---");
  check("GET /api/auth/get-session -> read", resolveTier("GET", "/api/auth/get-session") === "read");
  check("GET /api/auth/session -> read", resolveTier("GET", "/api/auth/session") === "read");
  check("POST /api/auth/sign-in/email -> auth", resolveTier("POST", "/api/auth/sign-in/email") === "auth");
  check("POST /api/auth/sign-up/email -> auth", resolveTier("POST", "/api/auth/sign-up/email") === "auth");
  check("GET /api/medicines -> read", resolveTier("GET", "/api/medicines") === "read");
  check("POST /api/orders -> write", resolveTier("POST", "/api/orders") === "write");
  check("DELETE /api/cart/1 -> write", resolveTier("DELETE", "/api/cart/1") === "write");

  console.log("--- exemptions ---");
  check("GET /api/auth/get-session exempt", isExemptFromLimiting("GET", "/api/auth/get-session"));
  check("GET /api/auth/session exempt", isExemptFromLimiting("GET", "/api/auth/session"));
  check("OPTIONS exempt", isExemptFromLimiting("OPTIONS", "/api/orders"));
  check("POST /api/auth/sign-in/email not exempt", !isExemptFromLimiting("POST", "/api/auth/sign-in/email"));
  check("GET /api/medicines not exempt", !isExemptFromLimiting("GET", "/api/medicines"));

  console.log("--- budgets ---");
  check("auth 10/15m", TIER_POLICIES.auth.max === 10 && TIER_POLICIES.auth.windowMs === 900_000);
  check("read 300/min", TIER_POLICIES.read.max === 300 && TIER_POLICIES.read.windowMs === 60_000);
  check("write 60/min", TIER_POLICIES.write.max === 60 && TIER_POLICIES.write.windowMs === 60_000);
  check(
    "old global 100/min bucket removed",
    !Object.values(TIER_POLICIES).some((t) => t.max === 100 && t.windowMs === 60_000),
  );

  await prisma.rateLimit.deleteMany({ where: { key: { startsWith: "verify" } } });
  await prisma.$disconnect();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
