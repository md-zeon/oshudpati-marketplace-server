import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import {
  isExemptFromLimiting,
  resolveTier,
  TIER_POLICIES,
  type RateLimitTier,
} from "../config/rateLimit.config";

interface BucketRow {
  count: number;
  resetAt: Date;
}

const PRUNE_INTERVAL_MS = 5 * 60_000;
let lastPruneAt = 0;

/**
 * Single round trip: insert the bucket, or advance it when the window is still
 * live, then return the new count. Avoids the read-then-write race that lets
 * concurrent requests each observe a stale count.
 */
async function consume(
  tier: RateLimitTier,
  identifier: string,
): Promise<BucketRow | null> {
  const { windowMs } = TIER_POLICIES[tier];
  const rows = await prisma.$queryRaw<BucketRow[]>`
    INSERT INTO "rate_limit" ("key", "count", "resetAt", "createdAt", "updatedAt")
    VALUES (${bucketKey(tier, identifier)}, 1, ${new Date(Date.now() + windowMs)}, NOW(), NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count"     = CASE WHEN "rate_limit"."resetAt" <= NOW() THEN 1 ELSE "rate_limit"."count" + 1 END,
      "resetAt"   = CASE WHEN "rate_limit"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "rate_limit"."resetAt" END,
      "updatedAt" = NOW()
    RETURNING "count", "resetAt"
  `;
  return rows[0] ?? null;
}

function clientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    const first = forwarded[0].split(",")[0];
    if (first) return first.trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function bucketKey(tier: RateLimitTier, identifier: string): string {
  return `${tier}:${identifier}`;
}

async function pruneExpiredBuckets(): Promise<void> {
  const now = Date.now();
  if (now - lastPruneAt < PRUNE_INTERVAL_MS) return;
  lastPruneAt = now;
  try {
    await prisma.rateLimit.deleteMany({
      where: { resetAt: { lt: new Date(now) } },
    });
  } catch (error) {
    console.error("rate limit prune failed", error);
  }
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  if (isExemptFromLimiting(req.method, req.path)) {
    next();
    return;
  }

  const tier = resolveTier(req.method, req.path);
  const { max, windowMs } = TIER_POLICIES[tier];
  const identifier = clientIp(req);

  consume(tier, identifier)
    .then((row) => {
      if (!row) {
        next();
        return;
      }

      const remaining = Math.max(0, max - row.count);
      const resetSeconds = Math.max(
        0,
        Math.ceil((row.resetAt.getTime() - Date.now()) / 1000),
      );

      res.setHeader("RateLimit-Limit", String(max));
      res.setHeader("RateLimit-Remaining", String(remaining));
      res.setHeader("RateLimit-Reset", String(resetSeconds));
      res.setHeader("RateLimit-Policy", `${max};w=${Math.round(windowMs / 1000)}`);

      if (row.count > max) {
        res.setHeader("Retry-After", String(resetSeconds));
        res.status(429).json({
          error: "Too many requests",
          retryAfter: resetSeconds,
        });
        return;
      }

      void pruneExpiredBuckets();
      next();
    })
    .catch((error) => {
      // A limiter outage must not take down the API.
      console.error("rate limit check failed, allowing request", error);
      next();
    });
}
