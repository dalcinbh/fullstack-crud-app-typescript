# Backend API - Project Management System

A modern, well-architected REST API built with TypeScript, Express, and Prisma using ESM (ES Modules). This backend implements clean architecture principles with comprehensive validation, proper separation of concerns, and production-ready features.

## 🏗️ Architecture

This API follows **Clean Architecture** principles with:

- **Controllers**: HTTP interface layer handling request/response formatting
- **Business Logic Classes**: Domain logic encapsulated in dedicated classes
- **Database Layer**: Prisma ORM with proper connection management
- **Interfaces**: TypeScript contracts ensuring type safety across layers
- **Validation**: Multi-step validation chains for data integrity

## 🚀 Tech Stack

- **Node.js 18.20.8+** - Runtime environment
- **TypeScript 5.4.2** - Type-safe development with ESM
- **Express 4.18.2** - Web framework with middleware support
- **Prisma 5.12.0** - Type-safe ORM with auto-generated client
- **MySQL 8.0+** - Relational database with foreign key constraints
- **ESM (ES Modules)** - Modern JavaScript module system

## 📋 Prerequisites

- **Node.js 18.20.8** or higher
- **MySQL 8.0** or higher
- **npm** or **yarn** package manager

## 🔧 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Optional: Open Prisma Studio for database inspection
npm run db:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run clean` | Clean build directory |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Prisma Studio interface |

## 📁 Project Structure

```
backend/
├── classes/              # Business logic classes
│   ├── project.class.ts  # Project domain operations
│   └── task.class.ts     # Task domain operations
├── config/               # Configuration files
│   └── prisma.ts         # Database connection setup
├── controllers/          # HTTP request handlers
│   ├── project.controller.ts
│   └── task.controller.ts
├── interfaces/           # TypeScript type definitions
│   ├── project.interface.ts
│   └── task.interface.ts
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Database schema definition
│   └── migrations/      # Database migration files
├── routes/              # API route definitions
│   ├── project.routes.ts
│   ├── task.routes.ts
│   └── router.route.ts  # Main router configuration
├── app.ts               # Application entry point
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## 🔗 API Endpoints

### Health Check

```
GET  /                    # API status and version
GET  /api                 # API information endpoint
```

### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects with optional search |
| `GET` | `/api/projects/:id` | Get specific project by ID |
| `POST` | `/api/projects` | Create new project |
| `PUT` | `/api/projects/:id` | Update existing project |
| `DELETE` | `/api/projects/:id` | Delete project and all tasks |

### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:projectId/tasks` | List all tasks for a project |
| `POST` | `/api/projects/:projectId/tasks` | Create new task in project |
| `PUT` | `/api/projects/:projectId/tasks/:taskId` | Update existing task |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId/complete` | Toggle task completion |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | Delete task from project |

## 📝 API Examples

### Create Project with Initial Tasks

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Website Redesign",
    "description": "Complete redesign of company website",
    "startDate": "2024-01-15",
    "tasks": [
      {
        "title": "Research competitors",
        "description": "Analyze competitor websites and design trends",
        "dueDate": "2024-01-20"
      },
      {
        "title": "Create wireframes",
        "description": "Design initial wireframes for key pages",
        "dueDate": "2024-01-25"
      }
    ]
  }'
```

### Search Projects

```bash
curl "http://localhost:5000/api/projects?search=website"
```

### Create Task in Project

```bash
curl -X POST http://localhost:5000/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement responsive design",
    "description": "Ensure website works on all device sizes",
    "dueDate": "2024-02-01"
  }'
```

### Toggle Task Completion

```bash
curl -X PATCH http://localhost:5000/api/projects/1/tasks/1/complete
```

## 🏛️ Architecture Details

### Business Logic Classes

**Project Class** (`classes/project.class.ts`)
- Handles all project-related operations
- Includes project statistics and analytics
- Manages project-task relationships

**Task Class** (`classes/task.class.ts`)
- Manages task lifecycle within projects
- Implements priority calculation algorithms
- Handles overdue task detection

### Validation System

The API implements a **3-step validation chain** for task operations:

1. **Project Exists**: Validates the parent project exists
2. **Task Exists**: Validates the task exists in the database
3. **Relationship Validation**: Ensures task belongs to the specified project

### Response Format

All API endpoints return consistent JSON responses:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔒 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🛠️ Development Guidelines

### TypeScript Configuration

- **ESM (ES Modules)** with `.js` extensions in imports
- **Strict mode** enabled for type safety
- **Node.js 18** target for modern features
- **Path mapping** for clean imports

### Code Organization

```typescript
// Example: Using business logic classes
import { Project } from '../classes/project.class.js';

// Get projects with search
const result = await Project.getAllProjects({ 
  search: 'website' 
});

// Get project statistics
const project = new Project(projectData);
const stats = project.getBasicStats();
```

### Database Operations

```typescript
// All database operations use Prisma
import prisma from '../config/prisma.js';

// Type-safe queries with relationships
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: { tasks: true }
});
```

## 🚀 Deployment

### Production Build

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Docker Database Setup

#### Prerequisites

- **Docker** installed on your system
- **Docker Compose** installed on your system

#### MySQL Database Setup

Start the MySQL database with phpMyAdmin using Docker Compose:

```bash
# Navigate to docker directory
cd docker/mysql

# Start MySQL and phpMyAdmin containers
docker compose up -d

# Check if containers are running
docker compose ps
```

This will start:
- **MySQL 8.0** on port `3306`
- **phpMyAdmin** on port `8081` (http://localhost:8081)

**Database Connection Details:**
- **Host**: `localhost`
- **Port**: `3306`
- **Database**: `projects`
- **Username**: `user`
- **Password**: `password`
- **Root Password**: `root`

**Environment Variable:**
```bash
DATABASE_URL="mysql://user:password@localhost:3306/projects"
```

#### Stop Database

```bash
# Stop and remove containers
docker compose down

# Stop and remove containers with volumes (removes data)
docker compose down -v
```

### Production Deployment with Nginx + PM2

> This project will not be published in real production, but this section demonstrates how the complete deployment process would work locally or on a private server.

#### 1. Clone repository on server

```bash
git clone https://github.com/your-username/your-repository.git
cd your-repository
npm install
```

#### 2. Create frontend build

```bash
npm run build
```

This will generate the `build/` folder inside the project (assuming React or similar).

#### 3. Install and run backend with PM2

```bash
npm install -g pm2
pm2 start npm --name gp-backend -- start
pm2 save
```

#### 4. Configure Nginx

Assuming the domain used is `projectmanager.test`, here's a minimal configuration example:

```nginx
server {
    listen 80;
    server_name projectmanager.test;

    root /var/www/gp/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

📝 **Note**: Adjust paths as needed, especially the `root` path, according to where your `build` folder is located.

#### 5. Restart Nginx

```bash
sudo systemctl restart nginx
```

Done! The frontend will be accessible at `http://projectmanager.test` and will make requests to the backend via `/api`.

### Application Dockerfile

For production deployment of the Node.js application:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./
EXPOSE 5000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common ESM Issues

**Import/Export Errors:**
- Ensure `"type": "module"` in `package.json`
- Use `.js` extensions in local imports
- Use `import` syntax instead of `require`

**Prisma Client Issues:**
```bash
# Regenerate Prisma client
npm run db:generate

# Reset database (development only)
npx prisma migrate reset --force
```

### Database Connection Issues

1. Verify MySQL server is running
2. Check `DATABASE_URL` format and credentials
3. Ensure database exists and is accessible
4. Run migrations: `npm run db:migrate`

## 📊 Features

- ✅ **Clean Architecture** with separation of concerns
- ✅ **Type Safety** with comprehensive TypeScript interfaces
- ✅ **Validation Chains** for data integrity
- ✅ **Error Handling** with proper HTTP status codes
- ✅ **CORS Configuration** for frontend integration
- ✅ **Graceful Shutdown** for production reliability
- ✅ **Health Checks** for monitoring
- ✅ **Project-Task Relationships** with cascade deletion
- ✅ **Search Functionality** across projects
- ✅ **Task Priority System** based on due dates
- ✅ **Overdue Task Detection** for project management

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.



---

**API Version**: 1.0.0  
**Node.js**: 18.20.8+  
**TypeScript**: 5.4.2
