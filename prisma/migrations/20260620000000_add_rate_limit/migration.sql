-- Rate limiting counters shared across serverless instances.
-- The counter is advanced by a single atomic upsert in the limiter middleware,
-- so no row-level locking beyond the primary key is required.
CREATE TABLE IF NOT EXISTS "rate_limit" (
    "key"       TEXT NOT NULL,
    "count"     INTEGER NOT NULL DEFAULT 0,
    "resetAt"   TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rate_limit_pkey" PRIMARY KEY ("key")
);

-- Backs opportunistic pruning of expired windows.
CREATE INDEX IF NOT EXISTS "rate_limit_resetAt_idx" ON "rate_limit" ("resetAt");
