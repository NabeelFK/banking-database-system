# CPSC 471 Banking App

Next.js frontend, Express backend, MySQL database.

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

This creates the `BankDB` database with all tables and two test users.

### 4. Create the backend env file

Copy `.env.example` to `.env` inside the `server/` folder:

```bash
cp server/.env.example server/.env
```

If your MySQL root user has a password, open `server/.env` and fill in `DB_PASSWORD`.

---

## Running the App

You need two terminals open at the same time.

**Terminal 1 — backend:**

```bash
cd server
npm run dev
```

Runs on `http://localhost:4000`

**Terminal 2 — frontend:**

```bash
npm run dev
```

Runs on `http://localhost:3000`

Open `http://localhost:3000` in your browser.

---

## Test Accounts

| Role     | Email            | Password |
|----------|------------------|----------|
| Customer | alice@email.com  | password |
| Employee | carol@email.com  | password |
| Manager  | emma@email.com   | password |

Customer login is at `/login`, employee/manager login is at `/employee/login`.

---

## Project Structure

```
├── database/
│   └── init.sql          # schema + seed data
├── server/
│   ├── index.js          # Express entry point
│   ├── db.js             # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js       # JWT auth middleware
│   └── routes/           # one file per API route
├── src/
│   ├── app/              # Next.js pages
│   ├── components/       # shared UI components
│   └── lib/
│       └── api.ts        # fetch wrapper
└── README.md
```

---

## Notes

- The database is local only — GitHub only has the SQL setup file, not the actual data
- If login fails, make sure the backend is running and `server/.env` exists
- The frontend proxies all `/api/*` requests to `http://localhost:4000` via `next.config.ts`
