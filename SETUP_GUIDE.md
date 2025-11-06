# Lets-Go-WorkSpace Complete Setup Guide

## Directory Structure Setup

This guide provides instructions for completing the full directory structure of the Lets-Go-WorkSpace project.

### Current Repository Structure

The repository currently contains:
```
Lets-Go-WorkSpace/
├── .github/workflows/ci-cd.yml        # CI/CD Pipeline
├── backend/
│   ├── package.json                  # Backend dependencies
│   └── server.js                     # Express server entry point
├── docs/
│   ├── README_Architecture.md        # System architecture documentation
│   └── UMLs/                         # (Placeholder for UML diagrams)
├── .gitignore                        # Node.js ignore patterns
├── LICENSE                           # MIT License
├── README.md                         # Project documentation
└── SETUP_GUIDE.md                    # This file
```

## Step 1: Create Backend Directory Structure

After cloning the repository locally, run:

```bash
# Navigate to backend
cd backend

# Create directory structure
mkdir -p src/{controllers,models,routes,middleware,utils,validators}
mkdir -p config
mkdir -p database/migrations
mkdir -p tests

# Create .env file
echo "NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lets_go_workspace
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret_key
" > .env
```

### Backend Files to Create

Create the following files in each directory:

#### src/utils/logger.js
```javascript
// Winston logger configuration
const winston = require('winston');
// Logger setup here
```

#### src/utils/errorHandler.js
```javascript
// Custom error handling utilities
```

#### src/middleware/auth.js
```javascript
// JWT authentication middleware
```

#### src/models/ (Create model files)
- User.js
- Room.js
- Booking.js
- Invoice.js
- Pricing.js

#### src/controllers/ (Create controller files)
- userController.js
- roomController.js
- bookingController.js
- invoiceController.js
- pricingController.js

#### src/routes/ (Create route files)
- userRoutes.js
- roomRoutes.js
- bookingRoutes.js
- invoiceRoutes.js
- pricingRoutes.js

#### database/schema.sql
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS lets_go_workspace;
USE lets_go_workspace;

-- Create tables
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  amenities JSON,
  base_price DECIMAL(10, 2),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  customizations JSON,
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('unpaid', 'paid', 'overdue') DEFAULT 'unpaid',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### database/migrations/001_initial_schema.js
```javascript
// Migration runner
```

## Step 2: Create Frontend Directory Structure

```bash
# Navigate to frontend
cd ../frontend

# Create directory structure
mkdir -p public
mkdir -p src/{components/{Common,User,Admin},pages/{User,Admin},services,store,hooks,styles,utils}
mkdir -p tests

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
" > .env
```

### Frontend Files to Create

- src/index.jsx - React entry point
- src/App.jsx - Root component
- public/index.html - HTML template
- src/services/api.js - API client
- src/store/store.js - Redux store
- src/components/Common/Header.jsx
- src/components/Common/Footer.jsx
- src/components/User/RoomBrowser.jsx
- src/components/User/BookingForm.jsx
- src/components/Admin/Dashboard.jsx

## Step 3: Complete Documentation

The following documentation files are already in place or should be created:

- [x] README.md - Main project documentation
- [x] docs/README_Architecture.md - System architecture
- [ ] docs/UMLs/ - Add UML diagram images
- [ ] docs/API_DOCUMENTATION.md - API endpoint reference
- [ ] docs/CONTRIBUTING.md - Contribution guidelines
- [ ] docs/DEPLOYMENT.md - Deployment instructions

## Step 4: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Step 5: Initialize Database

```bash
# Backend
cd backend

# Run schema
mysql -u root -p < database/schema.sql

# Run migrations
npm run migrate
```

## Step 6: Start Development Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

## Step 7: Git Workflow

```bash
# Create development branch
git checkout -b dev

# Create feature branch
git checkout -b feature/room-booking

# Make changes
git add .
git commit -m "LGW-5: Implement room booking feature"

# Push and create PR
git push origin feature/room-booking
```

## Step 8: GitHub Actions & Jira Integration

1. Connect Jira to GitHub repository
2. Use Jira ticket IDs in commits: `LGW-XXX`
3. GitHub Actions automatically runs CI/CD on push

## Useful Commands

### Backend
```bash
cd backend
npm run dev        # Start development server
npm run test       # Run tests
npm run lint       # Run ESLint
npm run migrate    # Run migrations
```

### Frontend
```bash
cd frontend
npm start          # Start dev server
npm run build      # Build for production
npm run test       # Run tests
```

### Git
```bash
git clone https://github.com/ssttrrss/Lets-Go-WorkSpace.git
git branch -a               # View all branches
git checkout dev           # Switch to development
git merge feature/room-booking  # Merge feature
```

## Next Steps

1. ✅ Fork and clone the repository
2. ✅ Install dependencies (npm install)
3. ✅ Create .env files
4. ✅ Setup database
5. ✅ Start development servers
6. ✅ Create feature branches
7. ✅ Make commits with Jira IDs
8. ✅ Create pull requests
9. ✅ Merge to dev, then to main

## Support

For issues or questions:
- Check README.md
- Review docs/README_Architecture.md
- Check GitHub Issues
- Contact team members

---

**Last Updated**: November 6, 2025
**Repository**: https://github.com/ssttrrss/Lets-Go-WorkSpace
