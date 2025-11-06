# Lets-Go-WorkSpace

> A smart booking and management system for coworking spaces with professional-grade DevOps practices.

## 🎯 Project Overview

**Lets-Go-WorkSpace** is a comprehensive full-stack application designed for managing coworking spaces efficiently. It enables users to view, book, and customize rooms, while providing administrators with powerful management tools for availability, pricing, reports, and financial tracking.

### Key Features

- **User Portal**: Browse available rooms, make bookings, customize preferences
- **Admin Dashboard**: Manage room availability, pricing, and generate analytics reports
- **Flexible Room Booking**: Support for customizable room configurations
- **Offline Payment System**: Track invoices and debts automatically
- **Real-time Reporting**: Comprehensive analytics and business insights

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Setup Instructions](#setup-instructions)
- [Team Members](#team-members)
- [Development Workflow](#development-workflow)
- [Documentation](#documentation)
- [Integration](#integration)

## 🏗️ Project Structure

```
Lets-Go-WorkSpace/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── config/
│   ├── database/
│   │   ├── schema.sql
│   │   └── migrations/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── styles/
│   ├── package.json
│   └── index.html
├── docs/
│   ├── UMLs/
│   │   ├── UseCase.png
│   │   ├── ClassDiagram.png
│   │   ├── ActivityDiagram.png
│   │   ├── ERD.png
│   │   └── Sequence.png
│   ├── SystemDesign.pdf
│   └── README_Architecture.md
├── .gitignore
├── README.md
└── LICENSE
```

## 💻 Technologies Used

### Backend
- **Node.js** + **Express.js** - REST API Framework
- **Database**: SQL (MySQL/PostgreSQL)
- **Authentication**: JWT
- **Validation**: Joi

### Frontend
- **React.js** - UI Framework
- **Axios** - HTTP Client
- **State Management**: Redux/Context API
- **UI Components**: Material-UI/Ant Design

### DevOps & Tools
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions
- **Task Management**: Jira
- **Code Quality**: ESLint, Prettier

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Git
- MySQL/PostgreSQL

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configurations

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 👥 Team Members

- **Project Lead**: [Name]
- **Backend Developer**: [Name]
- **Frontend Developer**: [Name]
- **DevOps Engineer**: [Name]
- **QA Engineer**: [Name]

## 🔄 Development Workflow

### Branching Strategy

- **`main`** - Production-ready code
- **`dev`** - Development branch (integration point)
- **`feature/<feature-name>`** - Feature development
- **`bugfix/<bug-name>`** - Bug fixes

### Commit Convention

Use Jira ticket IDs in commits for automatic linking:

```bash
git commit -m "LGW-123: Implement room booking customization"
```

### Pull Request Process

1. Create feature branch from `dev`
2. Make changes and commit
3. Push to GitHub
4. Create Pull Request with description
5. Code review by team
6. Merge to `dev` after approval
7. Release manager merges `dev` to `main`

## 📚 Documentation

- **System Architecture**: See `/docs/README_Architecture.md`
- **UML Diagrams**: See `/docs/UMLs/`
- **API Documentation**: Generated via Swagger (in progress)
- **Database Schema**: See `/backend/database/schema.sql`

## 🔗 Integration

### Jira Integration

GitHub is connected with Jira for automatic issue tracking:

- Commits with `LGW-XXX` automatically update Jira tickets
- Pull requests linked to story/task
- Release notes auto-generated

### GitHub Actions CI/CD

Automated testing and deployment on every push to main branches.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Last Updated**: November 6, 2025
**Repository**: https://github.com/ssttrrss/Lets-Go-WorkSpace
