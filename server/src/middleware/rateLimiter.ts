import { Request, Response, NextFunction } from 'express';

interface ClientRecord {
  count: number;
  resetTime: number;
}

const clientMap = new Map<string, ClientRecord>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 40;     // 40 requests per minute

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  // Periodically prune expired records to avoid unbounded memory growth
  if (clientMap.size > 500) {
    for (const [key, val] of clientMap.entries()) {
      if (now > val.resetTime) {
        clientMap.delete(key);
      }
    }
  }

  const record = clientMap.get(ip);

  if (!record || now > record.resetTime) {
    clientMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    res.status(429).json({
      error: 'Too many requests. Please slow down and try again in a minute.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
    return;
  }

  record.count += 1;
  next();
}
