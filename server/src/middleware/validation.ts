import { Request, Response, NextFunction } from 'express';

export function validateCoordinates(req: Request, res: Response, next: NextFunction) {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({
      error: 'Invalid coordinates provided. Latitude must be -90 to 90 and Longitude must be -180 to 180.',
    });
  }

  next();
}

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  // Strip control characters and trim
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim().slice(0, 1000);
}
