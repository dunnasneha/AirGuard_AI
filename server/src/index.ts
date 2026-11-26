import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');

// Trust first reverse proxy so req.ip resolves client IP accurately for rate limiting
app.set('trust proxy', 1);

// HTTP Security headers (iframe-compatible)
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Security and CORS configuration
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Request limits to prevent large payloads
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production' && !process.env.VITEST) {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend files in production if built
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
          <head><title>AirWise AI Server</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #059669;">AirWise AI Backend API is Running</h1>
            <p>API Endpoint: <a href="/api/health">/api/health</a></p>
            <p>Run <code>npm run dev</code> to build the frontend and start the full-stack server on port ${PORT}.</p>
          </body>
        </html>
      `);
    }
  });
});

// Central error handler (never expose internal stack or error details to clients)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err.message);
  res.status(500).json({
    error: 'Internal server error occurred.',
  });
});

if (!process.env.VITEST) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AirWise AI Server listening on port ${PORT}`);
    console.log(`Health check ready at http://0.0.0.0:${PORT}/api/health`);
    console.log(`Gemini API configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  });
}

export default app;
