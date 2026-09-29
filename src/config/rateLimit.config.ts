export type RateLimitTier = "auth" | "read" | "write";

export interface TierPolicy {
  max: number;
  windowMs: number;
}

export const TIER_POLICIES: Record<RateLimitTier, TierPolicy> = {
  // Credential endpoints: the only real brute-force surface.
  auth: { max: 10, windowMs: 15 * 60_000 },
  // Absorbs Next.js RSC prefetch fan-out from <Link> tags in the viewport.
  read: { max: 300, windowMs: 60_000 },
  write: { max: 60, windowMs: 60_000 },
};

const READ_METHODS = new Set(["GET", "HEAD"]);

const AUTH_PREFIX = "/api/auth";

export function resolveTier(method: string, pathname: string): RateLimitTier {
  if (
    pathname.startsWith(AUTH_PREFIX) &&
    !READ_METHODS.has(method)
  ) {
    return "auth";
  }
  return READ_METHODS.has(method) ? "read" : "write";
}

/**
 * Session and account reads are authenticated by Better Auth on every call and
 * are not an abuse vector on their own. Counting them is what caused 429s on
 * ordinary navigation, because a single page view fans out into many parallel
 * requests. They are still protected transitively by the auth tier, which
 * covers every mutating credential endpoint.
 */
export function isExemptFromLimiting(
  method: string,
  pathname: string,
): boolean {
  if (method === "OPTIONS") return true;
  if (pathname === "/" || pathname === "/health") return true;
  if (!pathname.startsWith(AUTH_PREFIX)) return false;
  return READ_METHODS.has(method);
}
