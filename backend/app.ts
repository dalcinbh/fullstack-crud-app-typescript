import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import prisma from './config/prisma.js';
import router from './routes/router.route.js';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class App {
  private app: express.Application;
  private server: http.Server;
  private port: number;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = Number(process.env.PORT) || 5000;
    
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupDatabase();
  }

  private setupMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true
    }));

    // Upload directory
    this.app.use("/uploads", express.static(path.join(__dirname, "uploads")));
  }

  private setupRoutes(): void {
    this.app.use('/api', router);
    
    // Health check
    this.app.get('/', (req, res) => {
      res.json({ message: 'API is running!', version: '1.0.0' });
    });
  }

  private async setupDatabase(): Promise<void> {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    await prisma.$disconnect();
    this.server.close();
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Start the application
const app = new App();
app.start().catch(console.error);

export default app;
