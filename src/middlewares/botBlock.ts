import { Request, Response, NextFunction } from "express";

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

const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

export function botBlock(req: Request, res: Response, next: NextFunction) {
  const userAgent = req.headers["user-agent"] || "";

  const lowerUA = userAgent.toLowerCase();
  const isBot = botPatterns.some((bot) => lowerUA.includes(bot.toLowerCase()));

  if (isBot) {
    res.status(403).json({ error: "Access Denied" });
    return;
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.ip ||
    "unknown";

  const now = Date.now();
  const ipData = ipRequestCounts.get(ip);

  if (!ipData || now > ipData.resetTime) {
    ipRequestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    ipData.count++;
    if (ipData.count > RATE_LIMIT_MAX) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }
  }

  if (ipRequestCounts.size > 10000) {
    const cutoff = now - RATE_LIMIT_WINDOW;
    for (const [key, value] of ipRequestCounts.entries()) {
      if (value.resetTime < cutoff) {
        ipRequestCounts.delete(key);
      }
    }
  }

  next();
}
