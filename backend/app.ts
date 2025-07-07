/**
 * Main Application Entry Point
 * 
 * This file contains the primary Express.js application setup and configuration.
 * It implements a class-based architecture for organizing the application lifecycle,
 * including middleware setup, route configuration, database connection, and server
 * management with graceful shutdown handling.
 * 
 * The application follows these key principles:
 * - Clean separation of concerns through method organization
 * - Proper error handling and logging
 * - Graceful shutdown for production reliability
 * - Environment-based configuration
 * - CORS configuration for frontend integration
 * 
 * Environment Variables Required:
 * - PORT: Server port (defaults to 5000)
 * - FRONTEND_URL: Frontend URL for CORS (defaults to "*")
 * - DATABASE_URL: Database connection string
 * - NODE_ENV: Environment mode (development/production)
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import prisma from './config/prisma.js';
import router from './routes/router.route.js';

/**
 * Main Application Class
 * 
 * Encapsulates the entire Express.js application setup and lifecycle management.
 * This class handles server initialization, middleware configuration, route setup,
 * database connection, and graceful shutdown procedures.
 * 
 * The class-based approach provides:
 * - Clear separation of setup phases
 * - Proper encapsulation of server state
 * - Controlled startup and shutdown procedures
 * - Easy testing and maintenance
 * 
 * Lifecycle: Constructor → setupMiddlewares → setupRoutes → setupDatabase → start
 */
class App {
  private app: express.Application;
  private server: http.Server;
  private port: number;

  /**
   * Initializes the application instance and configures all components
   * 
   * Sets up the Express application, HTTP server, and port configuration.
   * Immediately calls setup methods to configure the application in the
   * correct order: middlewares, routes, then database connection.
   */
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = Number(process.env.PORT) || 5000;
    
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupDatabase();
  }

  /**
   * Configures Express middleware stack
   * 
   * Sets up essential middleware for request processing in the correct order:
   * - JSON parsing for request bodies
   * - URL-encoded form data parsing
   * - CORS configuration for frontend integration
   * 
   * CORS is configured to allow frontend integration with appropriate
   * headers and methods for REST API operations.
   * 
   * @private
   */
  private setupMiddlewares(): void {
    // Enable JSON parsing for request bodies
    this.app.use(express.json());
    
    // Enable URL-encoded form data parsing
    this.app.use(express.urlencoded({ extended: true }));
    
    // Configure CORS for frontend integration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "*", // Allow configured frontend or any origin
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // REST API methods
      allowedHeaders: ["Content-Type", "Authorization"], // Common headers
      credentials: true // Allow cookies and authentication
    }));
  }

  /**
   * Configures application routes and API endpoints
   * 
   * Mounts the main API router under the '/api' base path and sets up
   * a root health check endpoint. The API router handles all business
   * logic routes (projects, tasks, etc.) while keeping the root endpoint
   * simple for monitoring and health checks.
   * 
   * @private
   */
  private setupRoutes(): void {
    // Mount main API router under /api base path
    this.app.use('/api', router);
    
    // Root health check endpoint for monitoring and basic API status
    this.app.get('/', (req, res) => {
      res.json({ message: 'API is running!', version: '1.0.0' });
    });
  }

  /**
   * Establishes database connection using Prisma
   * 
   * Connects to the database using the configured Prisma client and handles
   * connection errors gracefully. If the database connection fails, the
   * application will exit with error code 1 to prevent running without
   * database access.
   * 
   * @private
   * @returns {Promise<void>} Resolves when database connection is established
   */
  private async setupDatabase(): Promise<void> {
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1); // Exit if database connection fails
    }
  }

  /**
   * Starts the HTTP server and begins listening for requests
   * 
   * Binds the server to the configured port and starts listening for
   * incoming requests. Uses '0.0.0.0' to accept connections from any
   * network interface, making it suitable for containerized deployments.
   * 
   * Provides startup logging with port and environment information.
   * If server startup fails, the application will exit with error code 1.
   * 
   * @public
   * @returns {Promise<void>} Resolves when server starts successfully
   */
  public async start(): Promise<void> {
    try {
      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${this.port}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1); // Exit if server startup fails
    }
  }

  /**
   * Gracefully shuts down the application
   * 
   * Properly closes the database connection and HTTP server to ensure
   * clean shutdown. This method is called by signal handlers to ensure
   * the application terminates gracefully when receiving shutdown signals.
   * 
   * @public
   * @returns {Promise<void>} Resolves when shutdown is complete
   */
  public async stop(): Promise<void> {
    await prisma.$disconnect(); // Close database connection
    this.server.close();        // Close HTTP server
  }
}

/**
 * Graceful Shutdown Signal Handlers
 * 
 * These handlers ensure the application shuts down cleanly when receiving
 * termination signals from the operating system or container orchestrator.
 * This is crucial for production deployments to prevent data corruption
 * and ensure proper cleanup of resources.
 */

// Handle SIGTERM (termination signal from container orchestrators)
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

// Handle SIGINT (interrupt signal from Ctrl+C)
process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await app.stop();
  process.exit(0);
});

/**
 * Application Instantiation and Startup
 * 
 * Creates the application instance and starts the server. Error handling
 * ensures that any startup failures are properly logged and the process
 * exits appropriately.
 */
const app = new App();
app.start().catch(console.error);

export default app;
