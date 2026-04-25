# CPSC 471 Banking App

A full-stack banking management web application developed as part of a CPSC 471 Database Management Systems group project.  
The system supports customer banking operations, employee workflows, and manager-level loan and assignment tools using a relational MySQL database.

---

## Overview

This application simulates a simplified online banking platform where:

- customers manage accounts, transfers, loans, and payees
- employees review customer requests and manage account status
- managers make final loan approval decisions and view assignment data

The project demonstrates relational database design using EER modeling, ER -> RM mapping, and a full-stack architecture consisting of a Next.js frontend, Express API server, and MySQL relational database.

---

## Features

### Customer Features

- Secure login
- View account balances
- Transfer funds between accounts
- View loans
- Request new loans
- Manage payees
- View transaction activity
- Access dashboard summaries

### Employee Features

- Review customer loan requests
- Move loans from Pending -> Under Review
- Freeze and unfreeze accounts
- View transaction activity
- Access employee dashboard tools

### Manager Features

- Final loan approval / rejection decisions
- View assignment and unassigned work data
- Access manager-only dashboard tools

---

## Database Design

The system uses a normalized relational schema derived from an Enhanced Entity Relationship (EER) model.

Key design elements include:

- subtype hierarchy  
  User -> Customer, Employee

- account specialization  
  Account -> Savings_acct, Checking_acct

- transaction specialization  
  Transaction -> Deposit, Withdraw, Transfer

- weak entity  
  Dependent depends on Employee

- associative relationships
  - Owns
  - Logs
  - Obtains
  - Pays

Composite attributes such as addresses and department locations are mapped into separate relational tables:

- User_Address
- Depart_Location

The schema enforces referential integrity using primary keys and foreign keys throughout the database.

---

## Technologies Used

Frontend:

- Next.js
- React
- TypeScript

Backend / API Layer:

- Node.js
- Express.js
- RESTful route architecture

Database:

- MySQL

Authentication & Security:

- JWT authentication
- bcrypt password hashing
- role-based access control middleware

---

## Group Project Notice

This project was developed collaboratively as part of a university group assignment.

Team members:

- Farhan Sheikh
- Nhat Vu
- Nabeel Furqan

---

## My Contributions

I contributed to the following areas of the project:

- frontend UI development
- customer and employee interface implementation
- dashboard page layouts and navigation flows
- documentation corrections and improvements
- final report alignment with database schema and implementation
- repository cleanup and README improvements
- assisting with integration between frontend pages and backend API routes
- helped ensure consistency between the EER diagram, relational schema, and implemented database structure

---

## Setup

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd <repo-folder>
```

### 2. Install dependencies

Frontend (run from project root):

```bash
npm install
```

Backend:

```bash
cd server
npm install
cd ..
```

### 3. Set up the database

Make sure MySQL is running, then import the schema and seed data:

```bash
mysql -u root < database/init.sql
```

This is intended to create the `BankDB` database, schema, procedures, and seeded demo data used by the project.

### 4. Create the backend env file

Copy `.env.example` to `.env` inside the `server/` folder:

```bash
cp server/.env.example server/.env
```

If your MySQL root user has a password, open `server/.env` and fill in `DB_PASSWORD`.

---

## Running the App

You need two terminals open at the same time.

**Terminal 1 - backend:**

```bash
cd server
npm run dev
```

Runs on `http://localhost:4000`

**Terminal 2 - frontend:**

```bash
npm run dev
```

Runs on `http://localhost:3000`

Open `http://localhost:3000` in your browser.

---

## Test Accounts

| Role     | Email           | Password |
| -------- | --------------- | -------- |
| Customer | alice@email.com | password |
| Employee | carol@email.com | password |
| Manager  | emma@email.com  | password |

Customer login is at `/login`, employee/manager login is at `/employee/login`.

---

## Project Structure

```text
|-- database/
|   |-- schema.sql        # relational schema definition
|   `-- init.sql          # schema + seed data
|-- server/
|   |-- index.js          # Express entry point
|   |-- db.js             # MySQL connection pool
|   |-- middleware/
|   |   `-- auth.js       # JWT auth middleware
|   `-- routes/           # one file per API route
|-- src/
|   |-- app/              # Next.js pages
|   |-- components/       # shared UI components
|   |-- middleware.ts     # route protection and role redirects
|   `-- lib/
|       `-- api.ts        # fetch wrapper
`-- README.md
```

---

## Notes

- The database is local only; GitHub only includes the SQL setup files, not a running database instance
- If login fails, make sure the backend is running and `server/.env` exists
- The frontend proxies all `/api/*` requests to `http://localhost:4000` via `next.config.ts`
