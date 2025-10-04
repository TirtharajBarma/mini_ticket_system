# 🎫 HelpDesk Mini

A lightweight support ticket system for small teams. Track customer issues, assign tasks, and never miss an SLA deadline.

## Features

- User Authentication (JWT-based with user/admin roles)
- Ticket Management (Create, view, manage support tickets)
- SLA Tracking (Auto deadline calculation and overdue detection)
- Comments System (Add comments to tickets)
- Admin Dashboard (Manage all tickets)
- Responsive Design (Clean Tailwind CSS interface)

## Tech Stack

**Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Axios
**Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, Zod validation

## Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL database

### Setup
```bash
# Run the setup script
./setup.sh

# Or manual setup:
cd server && npm install && npm run db:generate
cd ../client && npm install
```

### Environment Setup
```bash
# Copy and edit environment file
cp server/.env.example server/.env

# Edit server/.env with your database URL and JWT secret:
# DATABASE_URL="postgresql://username:password@localhost:5432/helpdesk_db"
# JWT_SECRET="your-super-secret-jwt-key-here"

# Push database schema
cd server && npm run db:push
```

### Run Development
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm start
```

### Access
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## API Endpoints

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`
**Tickets:** `GET|POST /api/tickets`, `GET|PATCH|DELETE /api/tickets/:id`
**Comments:** `GET|POST /api/tickets/:id/comments`

## SLA Rules
- High Priority: 24 hours
- Medium Priority: 48 hours  
- Low Priority: 72 hours

## Create Admin User
1. Register normally through the app
2. Update role in database:
```sql
UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
```
3. Admin can now assign tickets to other users by User ID

## Project Structure
```
helpdesk-mini/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── store/          # Redux store
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database & auth config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth & validation
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utilities
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
├── setup.sh               # Setup script
└── README.md
```