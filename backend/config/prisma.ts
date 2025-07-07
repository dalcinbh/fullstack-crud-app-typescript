/**
 * Prisma Database Configuration
 * 
 * Central database connection configuration using Prisma ORM. This file creates
 * and exports a singleton instance of PrismaClient that serves as the main
 * database interface for the entire application.
 * 
 * Prisma is a modern ORM (Object-Relational Mapping) tool that provides:
 * - Type-safe database queries
 * - Auto-generated TypeScript types based on schema
 * - Database migration management
 * - Connection pooling and optimization
 * - Query optimization and caching
 * 
 * The singleton pattern ensures that only one database connection instance
 * is created and reused across all modules, preventing connection pool
 * exhaustion and improving performance.
 * 
 * This instance is imported and used by:
 * - Project.class.ts - For project-related database operations
 * - Task.class.ts - For task-related database operations
 * - Any other modules requiring database access
 * 
 * Database configuration (connection string, provider, etc.) is defined
 * in the prisma/schema.prisma file and environment variables.
 */

import { PrismaClient } from '@prisma/client'

/**
 * Global Prisma Client Instance
 * 
 * Creates a singleton instance of PrismaClient that manages database connections
 * and provides type-safe query methods. This instance handles:
 * 
 * - Database connection establishment and management
 * - Query execution with automatic type inference
 * - Connection pooling for optimal performance
 * - Transaction management
 * - Automatic query optimization
 * 
 * The client is configured based on the database schema and environment
 * variables, automatically connecting to the appropriate database
 * (development, production, etc.) based on the current environment.
 */
const prisma = new PrismaClient()

export default prisma
