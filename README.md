# Project Management System - Full Stack Application

A modern, full-stack project management application built with **React TypeScript frontend** and **Node.js backend API**. This system provides comprehensive project and task management capabilities with a clean, responsive interface and robust backend architecture.

## 🖥️ Setting Up the Local Environment (Step by Step)

Before running the system locally, make sure you follow these steps carefully. This section summarizes everything a developer needs to get the app running from scratch.

---

### 1. Install Global Tools

You must have the following installed on your machine:

| Tool | Recommended Version | Link |
|------|----------------------|------|
| **Node.js** | v18.20.8 or higher | https://nodejs.org/ |
| **npm** | v9+ (comes with Node.js) | — |
| **MySQL** | v8.0+ (if not using Docker) | https://dev.mysql.com/downloads/ |
| **Docker + Docker Compose** | Latest stable version | https://www.docker.com/products/docker-desktop |
| **Git** | Any version | https://git-scm.com/ |

💡 **Tip:** If you prefer using Docker for the database, you **do not need to install MySQL manually**. See section: [Docker Database Setup](#docker-database-setup)

---

### 2. Clone the Repository

```bash
git clone https://github.com/dalcinbh/test_project.git
cd your-repository
```

### 3. Start the MySQL Database

If you're using Docker, navigate to the MySQL docker folder and run:

```bash
cd docker/mysql
docker compose up -d
```

📌 This will start:
- **MySQL** at `localhost:3306`
- **phpMyAdmin** at `http://localhost:8081`

Make sure your `.env` file inside `backend/` points to:

```ini
DATABASE_URL="mysql://user:password@localhost:3306/projects"
```

### 4. Start the Backend Server

```bash
cd backend
cp .env.example .env        # Then edit DB credentials if needed
npm install
npm run db:generate         # Generate Prisma client
npm run db:migrate          # Create tables in the DB
npm run dev                 # Start the backend server (http://localhost:5000)
```

### 5. Start the Frontend App

```bash
cd frontend
cp .env.development.example.local .env.development.local   # Then set the API URL
npm install
npm start                      # Starts at http://localhost:3000
```

📣 **If any step fails, refer to the full documentation already included in the README under:**
- [🔧 Quick Start (Full System)](#-quick-start-full-system)
- [🛠️ Development Guidelines](#️-development-guidelines)
- [🐛 Troubleshooting](#-troubleshooting)

**This section is just a shortcut. Full details are explained below.**

## 🏗️ System Overview

This application is a complete project management solution featuring:

### **Frontend (React + TypeScript)**
- **React 19.1.0** with TypeScript for type-safe UI development
- **Redux Toolkit** for centralized state management
- **Tailwind CSS** for modern, responsive styling
- **TanStack Table** for advanced data table functionality
- **Modal-based workflows** for creating and editing projects/tasks

### **Backend (Node.js + Express)**
- **RESTful API** with TypeScript and Express
- **Clean Architecture** with separation of concerns
- **Prisma ORM** for type-safe database operations
- **MySQL database** with proper relational structure
- **ESM (ES Modules)** for modern JavaScript development

### **Database (MySQL)**
- **Projects table** with basic project information
- **Tasks table** with foreign key relationships
- **Cascade deletion** for data integrity
- **Proper indexing** for optimal query performance

## 🚀 Full Stack Tech Stack

### Frontend Technologies
- **React 19.1.0** - Modern UI library with hooks and concurrent features
- **TypeScript 5.4.2** - Type-safe development
- **Redux Toolkit 2.8.2** - State management with async thunks
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **TanStack React Table 8.21.3** - Advanced table functionality
- **React Redux 9.2.0** - React-Redux integration

### Backend Technologies
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
- **Git** for version control

## 🔧 Quick Start (Full System)

### 1. Clone Repository

```bash
git clone <repository-url>
cd project-management-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# Start backend development server
npm run dev
```

Backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.development.example.local .env.development.local
# Edit .env.development.local with your API URL

# Start frontend development server
npm start
```

Frontend will be available at `http://localhost:3000`

## 🎯 Frontend Structure & Features

### 📁 Frontend Project Structure

```
frontend/
├── public/
│   └── index.html           # Main HTML template
├── src/
│   ├── components/          # React components
│   │   ├── Project/         # Project-related components
│   │   │   ├── ProjectList.tsx      # Main project management interface
│   │   │   ├── AddProjectModal.tsx  # Project creation modal
│   │   │   ├── EditProjectModal.tsx # Project editing modal
│   │   │   └── Table.tsx           # Reusable table component
│   │   └── Task/            # Task-related components
│   │       ├── TaskItem.tsx         # Individual task component
│   │       ├── TaskTable.tsx        # Advanced task table
│   │       ├── AddTaskModal.tsx     # Task creation modal
│   │       └── TaskManagementModal.tsx # Task management interface
│   ├── config/
│   │   └── config.ts        # API configuration and HTTP client
│   ├── hooks/               # Custom React hooks
│   │   ├── use-app.dispatch.ts  # Type-safe Redux dispatch
│   │   └── use-app.selector.ts  # Type-safe Redux selector
│   ├── interfaces/          # TypeScript interfaces
│   │   ├── project.interface.ts  # Project-related types
│   │   └── task.interface.ts     # Task-related types
│   ├── services/            # API service layer
│   │   ├── project.service.ts    # Project API calls
│   │   └── task.service.ts       # Task API calls
│   ├── slices/              # Redux slices
│   │   ├── project.slice.ts      # Project state management
│   │   └── task.slice.ts         # Task state management
│   ├── utils/               # Utility functions
│   │   └── dateFormat.ts         # Date formatting utilities
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # Application entry point
│   ├── store.ts             # Redux store configuration
│   └── index.css            # Global styles and Tailwind CSS
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

### 🖥️ Frontend Features

- **📊 Project Management**
  - Create, edit, and delete projects
  - View project lists with search functionality
  - Project statistics and completion tracking
  - Responsive table with sorting and pagination

- **📋 Task Management**
  - Create tasks within projects
  - Edit task details and due dates
  - Toggle task completion status
  - Advanced task table with filtering
  - Task priority visualization

- **🎨 User Interface**
  - Modern, responsive design with Tailwind CSS
  - Modal-based workflows for better UX
  - Loading states and error handling
  - Consistent color scheme and typography

- **⚡ Performance**
  - Redux state management for efficient updates
  - Optimistic updates for better responsiveness
  - Memoized components to prevent unnecessary re-renders
  - Efficient table virtualization for large datasets

### 🎯 Frontend Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run eject` | Eject from Create React App (irreversible) |

## 🗄️ Database Structure

### 📊 Database Schema Overview

The system uses **MySQL** with a simple but effective relational structure designed for project management workflows.

```sql
-- Database: projects
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
```

### 🏗️ Tables Structure

#### **Projects Table**

```sql
CREATE TABLE `Project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `startDate` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Field Descriptions:**
- `id` - **Primary key**, auto-increment integer for unique project identification
- `name` - **Project title**, varchar(191) for project name/title display
- `description` - **Project details**, text field for comprehensive project description
- `startDate` - **Project start date**, datetime with precision for project timeline
- `createdAt` - **Record creation timestamp**, auto-generated when project is created
- `updatedAt` - **Last modification timestamp**, auto-updated on any project changes

#### **Tasks Table**

```sql
CREATE TABLE `Task` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL,
  `title` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `dueDate` datetime(3) NOT NULL,
  `isCompleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Task_projectId_fkey` (`projectId`),
  CONSTRAINT `Task_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Field Descriptions:**
- `id` - **Primary key**, auto-increment integer for unique task identification
- `projectId` - **Foreign key** referencing `Project.id`, establishes parent-child relationship
- `title` - **Task name**, varchar(191) for task title/summary display
- `description` - **Task details**, text field for comprehensive task description and requirements
- `dueDate` - **Task deadline**, datetime with precision for task scheduling and priority
- `isCompleted` - **Completion status**, boolean flag (0=pending, 1=completed) for task tracking
- `createdAt` - **Record creation timestamp**, auto-generated when task is created
- `updatedAt` - **Last modification timestamp**, auto-updated on any task changes

### 🔗 Database Relationships

#### **One-to-Many: Project → Tasks**

```sql
Project (1) ←→ Tasks (Many)
```

**Relationship Details:**
- **Parent**: `Project` table
- **Child**: `Task` table
- **Foreign Key**: `Task.projectId` → `Project.id`
- **Cascade Actions**: 
  - `ON DELETE CASCADE` - When a project is deleted, all associated tasks are automatically deleted
  - `ON UPDATE CASCADE` - When a project ID is updated, all associated task references are updated

**Business Logic:**
- Each project can have **multiple tasks** (0 to unlimited)
- Each task **belongs to exactly one project**
- Deleting a project **removes all its tasks** (data integrity)
- Tasks cannot exist without a parent project (referential integrity)

### 🎯 Database Features

- **✅ ACID Compliance** - Full transaction support with MySQL InnoDB
- **✅ Foreign Key Constraints** - Referential integrity between projects and tasks
- **✅ Cascade Deletion** - Automatic cleanup of related data
- **✅ Timestamp Tracking** - Automatic creation and update timestamps
- **✅ UTF-8 Support** - Full Unicode support for international characters
- **✅ Indexed Relationships** - Optimized queries with proper indexing

### 📈 Database Performance

**Indexing Strategy:**
- Primary keys (`id`) are automatically indexed
- Foreign key (`projectId`) has index for efficient JOIN operations
- Timestamps are indexed for sorting and filtering operations

**Query Optimization:**
- Efficient project-task JOINs using indexed foreign keys
- Proper use of LIMIT and OFFSET for pagination
- Optimized search queries with text indexing

## 🏛️ Backend Architecture

### 📁 Backend Project Structure

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

### 🔗 API Endpoints

#### Health Check

```
GET  /                    # API status and version
GET  /api                 # API information endpoint
```

#### Projects API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects` | List all projects with optional search |
| `GET` | `/api/projects/:id` | Get specific project by ID |
| `POST` | `/api/projects` | Create new project |
| `PUT` | `/api/projects/:id` | Update existing project |
| `DELETE` | `/api/projects/:id` | Delete project and all tasks |

#### Tasks API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/projects/:projectId/tasks` | List all tasks for a project |
| `POST` | `/api/projects/:projectId/tasks` | Create new task in project |
| `PUT` | `/api/projects/:projectId/tasks/:taskId` | Update existing task |
| `PATCH` | `/api/projects/:projectId/tasks/:taskId/complete` | Toggle task completion |
| `DELETE` | `/api/projects/:projectId/tasks/:taskId` | Delete task from project |

### 🎯 Backend Available Scripts

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

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `PORT` | Server port number | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `REACT_APP_ENV` | Environment mode | `development` or `production` |

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

#### Backend Build
```bash
cd backend
npm run build
npm start
```

#### Frontend Build
```bash
cd frontend
npm run build
# Static files will be in build/ directory
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
cd frontend
npm install
npm run build
```

This will generate the `build/` folder inside the frontend directory.

#### 3. Install and run backend with PM2

```bash
cd backend
npm install
npm run build
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

    root /var/www/gp/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
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

### Frontend Issues

**Build Errors:**
```bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues:**
1. Verify backend is running on correct port
2. Check `REACT_APP_API_URL` in environment variables
3. Verify CORS configuration in backend

## 📊 System Features

### ✅ Backend Features
- **Clean Architecture** with separation of concerns
- **Type Safety** with comprehensive TypeScript interfaces
- **Validation Chains** for data integrity
- **Error Handling** with proper HTTP status codes
- **CORS Configuration** for frontend integration
- **Graceful Shutdown** for production reliability
- **Health Checks** for monitoring
- **Project-Task Relationships** with cascade deletion
- **Search Functionality** across projects
- **Task Priority System** based on due dates
- **Overdue Task Detection** for project management

### ✅ Frontend Features
- **Modern React** with hooks and functional components
- **Redux State Management** with async thunks
- **Responsive Design** with Tailwind CSS
- **Modal Workflows** for better user experience
- **Advanced Tables** with sorting, filtering, and pagination
- **Form Validation** with real-time feedback
- **Loading States** and error handling
- **Optimistic Updates** for better performance
- **Type-Safe API Integration** with TypeScript

### ✅ Database Features
- **Relational Structure** with proper foreign keys
- **Cascade Operations** for data integrity
- **Automatic Timestamps** for audit trails
- **Unicode Support** for international content
- **Indexed Queries** for optimal performance
- **Transaction Support** for data consistency

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

**System Version**: 1.0.0  
**Frontend**: React 19.1.0 + TypeScript 5.4.2  
**Backend**: Node.js 18.20.8+ + TypeScript 5.4.2  
**Database**: MySQL 8.0+ with Prisma 5.12.0
