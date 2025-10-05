# 🎫 HelpDesk Mini

A lightweight support ticket system for small teams. Track customer issues, assign tasks, and never miss an SLA deadline.

## Features

- **User Authentication** - JWT-based with user/admin roles
- **Ticket Management** - Create, view, update, and delete support tickets
- **SLA Tracking** - Auto deadline calculation and overdue detection
- **Ticket Categories** - 7 categories (technical, billing, account, feature-request, bug-report, general, other)
- **Comments System** - Add comments to tickets with real-time updates
- **Canned Responses** - Pre-written response templates (admin only)
- **Customer Satisfaction** - 5-star rating system for closed tickets
- **Search & Filters** - Advanced filtering by status, priority, category, and text search
- **Analytics Dashboard** - Real-time metrics and charts for admins
- **User Management** - Admin can manage user roles and permissions
- **Responsive Design** - Clean Tailwind CSS interface

## Tech Stack

**Frontend:** React, Redux Toolkit, React Router, Tailwind CSS, Axios
**Backend:** Node.js, Express.js, Prisma ORM, PostgreSQL, JWT, Zod validation

## Quick Start

### Prerequisites
- Node.js 16+ installed
- PostgreSQL installed and running
- Git (optional, for cloning)

---

### 📦 Step 1: Installation

**Clone or navigate to the project directory:**
```bash
cd mini_ticket_system
```

**Install server dependencies:**
```bash
cd server
npm install
```

**Install client dependencies:**
```bash
cd ../client
npm install
```

---

### ⚙️ Step 2: Environment Setup

**Create a `.env` file in the `server` directory:**
```bash
cd ../server
touch .env
```

**Add the following configuration to `server/.env`:**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/helpdesk_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
ADMIN_SECRET_CODE="admin123"
PORT=5001
```

> **⚠️ Important:** Replace `username`, `password`, and `helpdesk_db` with your PostgreSQL credentials and database name.

---

### 🗄️ Step 3: Database Setup

**From the `server` directory, run:**
```bash
npx prisma generate
npx prisma db push
```

This will:
- Generate Prisma Client
- Create all database tables based on the schema
- Set up the database structure

---

### 🚀 Step 4: Start the Application

**Open two terminal windows:**

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm run dev
```
You should see: `✓ Server running on port 5001`

**Terminal 2 - Start Frontend:**
```bash
cd client
npm start
```
Browser will automatically open at `http://localhost:3000`

---

### 🎯 Step 5: Create Your First Admin User

1. Go to **Register** page (http://localhost:3000/register)
2. Fill in the form:
   - **Name:** Your name
   - **Email:** admin@example.com
   - **Password:** Your secure password
   - **Admin Code:** `admin123` (or whatever you set in `.env`)
3. Click **Register**
4. You'll be redirected to the dashboard with admin privileges

---

### ✅ Access Points

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Health Check:** http://localhost:5001/health
- **Database (Prisma Studio):** Run `npx prisma studio` from `server` directory

---

### 🛑 Troubleshooting

**Database connection error?**
- Check PostgreSQL is running: `psql -U postgres`
- Verify DATABASE_URL in `.env` is correct
- Ensure database exists: `createdb helpdesk_db`

**Port already in use?**
- Backend: Change `PORT` in `server/.env`
- Frontend: Set `PORT=3001` before running `npm start`

**Prisma errors?**
- Run `npx prisma generate` again
- Try `npx prisma db push --force-reset` (⚠️ deletes all data)

## API Endpoints

**Auth:** `POST /api/auth/register`, `POST /api/auth/login`
**Tickets:** `GET|POST /api/tickets`, `GET|PATCH|DELETE /api/tickets/:id`, `POST /api/tickets/:id/rate`
**Comments:** `GET|POST /api/tickets/:id/comments`
**Canned Responses:** `GET|POST|PUT|DELETE /api/canned-responses`
**Analytics:** `GET /api/analytics`
**Users:** `GET /api/users`, `PATCH /api/users/:id/role`, `DELETE /api/users/:id`

## SLA Rules
- High Priority: 24 hours
- Medium Priority: 48 hours  
- Low Priority: 72 hours

## Create Admin User
1. Register with the admin secret code during signup
2. Enter `ADMIN_SECRET_CODE` value from `.env` in the "Admin Code" field
3. Or update existing user role via User Management page (admin only)

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