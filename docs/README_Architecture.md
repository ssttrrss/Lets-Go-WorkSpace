# System Architecture Documentation

## Overview

Lets-Go-WorkSpace follows a modern **three-tier architecture** pattern with clear separation of concerns:

```
┌─────────────────┐
│   Frontend      │  React.js SPA
│   (Client)      │  
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │  Express.js + Node.js
│   (Server)      │  
└────────┬────────┘
         │ SQL
         │
┌────────▼────────┐
│   Database      │  MySQL/PostgreSQL
│   (Persistence) │  
└─────────────────┘
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Logging**: Winston
- **ORM**: Sequelize/TypeORM
- **API Documentation**: Swagger/OpenAPI

### Directory Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── validators/      # Input validation
├── config/              # Configuration files
├── database/
│   ├── schema.sql       # Database schema
│   └── migrations/      # Migration scripts
├── tests/               # Unit & integration tests
├── .env.example         # Environment variables template
├── server.js            # Application entry point
└── package.json         # Dependencies
```

### Core Components

#### 1. **Controllers** (`src/controllers/`)
- Handle HTTP requests/responses
- Validate input data
- Call service layer for business logic
- Return appropriate HTTP responses

#### 2. **Models** (`src/models/`)
- Define database entities
- Establish relationships between tables
- Include validation rules at model level

#### 3. **Routes** (`src/routes/`)
- Define API endpoints
- Map routes to controller methods
- Apply authentication and authorization middleware

#### 4. **Services** (`src/services/`)
- Contain business logic
- Handle data transformations
- Manage interactions with database
- Provide reusable functions for controllers

#### 5. **Middleware** (`src/middleware/`)
- Authentication (JWT verification)
- Authorization (role-based access control)
- Error handling
- Request logging
- CORS configuration

## Frontend Architecture

### Technology Stack
- **Framework**: React.js 18+
- **State Management**: Redux Toolkit / Context API
- **HTTP Client**: Axios
- **UI Library**: Material-UI v5 or Ant Design
- **Routing**: React Router v6
- **Build Tool**: Webpack/Vite

### Directory Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Common/     # Shared components
│   │   ├── User/       # User-specific components
│   │   └── Admin/      # Admin-specific components
│   ├── pages/          # Page components
│   │   ├── User/
│   │   └── Admin/
│   ├── services/        # API service layer
│   ├── store/          # Redux store & slices
│   ├── hooks/          # Custom React hooks
│   ├── styles/         # Global styles
│   ├── utils/          # Helper functions
│   ├── App.jsx         # Root component
│   └── index.jsx       # Entry point
├── .env.example        # Environment variables
└── package.json        # Dependencies
```

### Component Hierarchy

```
App
├── Router
│   ├── UserPages
│   │   ├── RoomBrowser
│   │   ├── Booking
│   │   └── UserDashboard
│   └── AdminPages
│       ├── Dashboard
│       ├── RoomManagement
│       ├── Pricing
│       └── Reports
├── Navigation
├── AuthGuard
└── Error Boundary
```

## Database Design

### Entity-Relationship Diagram (ERD)

**Core Entities:**

1. **Users**
   - user_id (PK)
   - email (UNIQUE)
   - password_hash
   - role (user | admin)
   - created_at

2. **Rooms**
   - room_id (PK)
   - name
   - capacity
   - amenities (JSON)
   - base_price
   - is_available
   - created_at

3. **Bookings**
   - booking_id (PK)
   - user_id (FK)
   - room_id (FK)
   - start_date
   - end_date
   - customizations (JSON)
   - status (pending | confirmed | cancelled)
   - created_at

4. **Invoices**
   - invoice_id (PK)
   - booking_id (FK)
   - user_id (FK)
   - amount
   - status (unpaid | paid | overdue)
   - due_date
   - created_at

5. **Pricing**
   - pricing_id (PK)
   - room_id (FK)
   - day_of_week
   - price
   - updated_at

## API Design

### RESTful Conventions

- **GET** `/api/rooms` - List all available rooms
- **GET** `/api/rooms/:id` - Get room details
- **POST** `/api/bookings` - Create a new booking
- **GET** `/api/bookings` - Get user bookings
- **PUT** `/api/bookings/:id` - Update booking
- **DELETE** `/api/bookings/:id` - Cancel booking
- **GET** `/api/invoices` - Get user invoices
- **GET** `/api/admin/reports` - Get analytics

### Response Format

```json
{
  "status": "success",
  "data": { /* response data */ },
  "message": "Operation completed",
  "timestamp": "2025-11-06T07:00:00Z"
}
```

## Security Considerations

1. **Authentication**: JWT tokens with secure expiration
2. **Authorization**: Role-based access control (RBAC)
3. **Data Protection**: Encrypted passwords using bcrypt
4. **HTTPS**: All communications over TLS
5. **CORS**: Configured for frontend domain only
6. **Input Validation**: Joi schema validation on all inputs
7. **Rate Limiting**: Prevent brute force attacks
8. **SQL Injection Prevention**: Parameterized queries via ORM

## Deployment Architecture

### Environment Setup

- **Development**: Local development with nodemon
- **Staging**: Pre-production testing environment
- **Production**: Cloud deployment with CI/CD

### Container Strategy (Docker)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## DevOps Pipeline

### GitHub Actions CI/CD Flow

```
Push to main
  ↓
Run Tests
  ↓
Build Docker Image
  ↓
Push to Registry
  ↓
Deploy to Production
```

## Performance Considerations

1. **Caching**: Redis for session and data caching
2. **Database Indexing**: On frequently queried fields
3. **API Pagination**: Limit results per request
4. **Frontend Optimization**: Code splitting, lazy loading
5. **CDN**: Serve static assets via CDN

## Monitoring & Logging

- **Logs**: Centralized logging with Winston
- **Errors**: Sentry for error tracking
- **Performance**: New Relic or Datadog APM
- **Uptime**: Monitoring via Pingdom

---

**Last Updated**: November 6, 2025
**Version**: 1.0
