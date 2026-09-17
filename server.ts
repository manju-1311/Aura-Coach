import 'dotenv/config';
import express from 'express';
import net from 'net';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbManager } from './server/db.js';
import apiRoutes from './server/routes.js';

const DEFAULT_PORT = Number(process.env.PORT || 3000);
const isProductionRun = process.env.NODE_ENV === 'production' || process.env.npm_lifecycle_event === 'start';

function getAvailablePort(port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getAvailablePort(port + 1));
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve(port));
    });

    server.listen(port, '0.0.0.0');
  });
}

async function startServer() {
  const app = express();
  const port = await getAvailablePort(DEFAULT_PORT);

  // Basic middleware with support for document and PDF uploads
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Connect to Database (MongoDB or embedded fallback)
  await dbManager.connect();

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Aura Coach AI Backend',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes FIRST
  app.use('/api', apiRoutes);

  // Vite middleware for development or static serving for production
  if (!isProductionRun) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Aura Coach server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
