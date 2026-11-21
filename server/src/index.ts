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
const PORT = process.env.PORT || 5000;

// Security and CORS configuration
app.use(cors({
  origin: true, // Allow frontend dev and deployed origins
  credentials: true,
}));

// Request limits to prevent large payloads
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '500kb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next: NextFunction) => {
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
      // If client is not built, provide a helpful API landing page
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>AirWise AI Server</title></head>
          <body style="font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #059669;">AirWise AI Backend API is Running</h1>
            <p>API Endpoint: <a href="/api/health">/api/health</a></p>
            <p>Please start the Vite client on port 5173 for development or run <code>npm run build</code>.</p>
          </body>
        </html>
      `);
    }
  });
});

// Central error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`AirWise AI Server listening on port ${PORT}`);
  console.log(`Health check ready at http://localhost:${PORT}/api/health`);
  console.log(`Gemini API configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});

export default app;
