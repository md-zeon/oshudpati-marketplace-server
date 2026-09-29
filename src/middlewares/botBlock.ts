import { Request, Response, NextFunction } from "express";

/**
 * NOTE: this list is duplicated in the Next.js edge middleware
 * (`src/proxy.ts` in oshudpati-marketplace-client). The two repos are deployed
 * independently, so the list cannot be shared as a module. Keep them in sync,
 * or move enforcement to a CDN/WAF rule and delete both copies.
 */
const botPatterns = [
  "Bytespider",
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "anthropic-ai",
  "ClaudeBot",
  "Amazonbot",
  "Applebot-Extended",
  "FacebookBot",
  "Meta-ExternalAgent",
  "DataForSeoBot",
  "Scrapy",
  "Semrush",
  "Ahrefs",
  "MJ12bot",
  "DotBot",
  "SeekportBot",
  "Sogou",
  "Exabot",
  "Nutch",
  "Baiduspider",
  "YandexBot",
  "bingbot",
  "MicrosoftPreview",
  "msnbot",
  "MicrosoftBingPreview",
  "MicrosoftBingbot",
  "Bingbot",
  "BingPreview",
];

const suspiciousPatterns = [
  "\\.php",
  "\\.asp",
  "\\.cgi",
  "\\.pl",
  "\\.py",
  "wp-admin",
  "wp-login",
  "xmlrpc",
  "wp-content",
  "wp-includes",
  "phpmyadmin",
];

function isBot(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return botPatterns.some((bot) => lowerUA.includes(bot.toLowerCase()));
}

function isSuspicious(path: string): boolean {
  const lowerPath = path.toLowerCase();
  return suspiciousPatterns.some((pattern) =>
    new RegExp(pattern, "i").test(lowerPath),
  );
}

/**
 * User-agent and path policy only. Volume limiting lives in `rateLimit.ts`,
 * which counts against Postgres so the limits hold across Vercel instances.
 */
export function botBlock(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers["user-agent"] || "";

  if (isBot(userAgent)) {
    res.status(403).json({ error: "Access Denied" });
    return;
  }

  if (isSuspicious(req.path)) {
    res.status(403).json({ error: "Access Denied" });
    return;
  }

  next();
}
