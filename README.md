# Nordic Analytics — Fund Intelligence Dashboard

A mini Fund Intelligence platform with a Node.js/TypeScript REST API and a React/TypeScript frontend.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd nordic-analytics
```

---

### 2. Start the Backend API

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

The API will be live at **http://localhost:5000**.

The seed script:
- initialises the SQLite database
- creates all required tables
- inserts all mock fund data
- inserts the demo user

### Demo Credentials

```text
email:    demo@nordic.io
password: demo123
```

---

### 3. Start the Frontend

In a separate terminal:

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend communicates with the backend API running on port `5000`.

---

# API Reference

All `/api/funds` endpoints require a valid JWT in the:

```text
Authorization: Bearer <token>
```

header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ✗ | Returns JWT token |
| GET | `/api/funds` | ✓ | List all funds with summary metrics |
| GET | `/api/funds/:id` | ✓ | Full fund detail with NAV history and portfolio companies |
| GET | `/api/funds/:id/performance` | ✓ | NAV history with optional date filtering |
| GET | `/api/funds/:id/portfolio` | ✓ | Portfolio companies with optional flag filtering |
| GET | `/api/health` | ✗ | Health check endpoint |

---

# Quick Test with curl

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@nordic.io\",\"password\":\"demo123\"}"
```

Example response:

```json
{
  "token": "eyJhbGciOi..."
}
```

---

# Database

File:

```text
backend/schema.sql
```

The project uses:

```text
sql.js (SQLite WebAssembly version)
```

This allows:
- simple setup
- zero external database installation
- cross-platform compatibility

---

# Tables

## `users`

Stores login users.

Fields:
- id
- email
- password hash

Passwords are stored using bcrypt hashing.

---

## `funds`

Stores core fund information.

Includes:
- fund name
- type
- vintage year
- total commitments
- financial metrics

Metrics were intentionally stored directly in the funds table to simplify reads and avoid unnecessary joins.

---

## `nav_history`

Stores monthly NAV performance data.

Each row represents:
- one fund
- one month
- one NAV value

Used by the frontend chart component.

---

## `portfolio_companies`

Stores portfolio company information.

Includes:
- revenue
- EBITDA
- margin
- current value
- status flags

Flags such as:
- `watch`
- `at-risk`

are stored as comma-separated values for simplicity.

---

# Key Database Design Decisions

## SQLite Instead of PostgreSQL

SQLite was chosen because:
- lightweight
- zero configuration
- ideal for take-home projects
- easy local setup

In production, PostgreSQL would likely be used.

---

## Indexing

An index was added on:

```sql
nav_history(fund_id)
```

This improves chart performance because NAV history queries are the most common and data-intensive operations.

---

## Foreign Keys

Relationships between tables are maintained using foreign keys:

- `nav_history.fund_id → funds.id`
- `portfolio_companies.fund_id → funds.id`

This keeps relational integrity clean.

---

# Authentication Design

JWT authentication is implemented using `jsonwebtoken`.

Flow:

1. User logs in
2. Backend validates credentials
3. JWT token generated
4. Frontend stores token
5. Token sent in Authorization header
6. Backend middleware validates token
7. Protected endpoints become accessible

---

# API Design Decisions & Trade-offs

## JWT Authentication

JWT was chosen because:
- stateless
- scalable
- industry standard
- no server-side sessions required

Trade-off:
- tokens cannot be invalidated before expiry without additional infrastructure

---

## Separate Frontend and Backend

Frontend and backend run independently.

Benefits:
- modular architecture
- easier scaling
- cleaner separation of concerns
- easier deployment flexibility

---

## Dedicated Performance Endpoint

`/performance` was separated into its own endpoint because:
- chart data is loaded independently
- supports date filtering
- easier future caching

---

## Portfolio Filtering

The bonus endpoint supports:

```text
?flag=watch
?flag=at-risk
```

This demonstrates:
- backend filtering
- query parameter handling
- dynamic API responses

---

# Frontend Design

The frontend was built using:
- React
- TypeScript
- Vite

---

# Frontend Features

## Login Page

Authenticates the user and stores JWT token.

---

## Fund Selector Sidebar

Allows switching between funds dynamically.

---

## NAV Performance Chart

Displays NAV growth/decline over time using Recharts.

---

## Portfolio Companies Table

Displays:
- company financials
- sectors
- countries
- status indicators

Visual badges were added for:
- Watch
- At Risk
- Active

---

# State Management

React hooks were used:
- `useState`
- `useEffect`

For this project size, external state libraries like Redux were unnecessary.

---

# Error Handling

Backend APIs return consistent JSON errors:

```json
{
  "error": "Unauthorized"
}
```

Appropriate HTTP status codes are used:
- 400
- 401
- 404
- 500

---

# Running Tests

```bash
cd backend
npm test
```

Tests include:
- login validation
- protected route access
- fund retrieval
- performance filtering
- portfolio filtering

---

# What I Would Build Next (Production Roadmap)

1. Refresh token rotation
2. Redis-based token invalidation
3. Role-based access control
4. PostgreSQL migration
5. Docker containerization
6. CI/CD pipeline
7. API rate limiting
8. Audit logging
9. Redis caching
10. Pagination and advanced filtering
11. Monitoring and observability
12. OpenAPI/Swagger documentation
13. CSV export support
14. Fund comparison dashboard
15. Date-range picker for charts

---

# Project Structure

```text
nordic-analytics/
├── backend/
│   ├── data/
│   │   └── nordic.db
│   ├── node_modules/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.ts
│   │   │   └── seed.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   └── funds.ts
│   │   ├── funds.test.ts
│   │   └── index.ts
│   ├── .env
│   ├── .env.example
│   ├── jest.config.json
│   ├── package-lock.json
│   ├── package.json
│   ├── schema.sql
│   └── tsconfig.json
│
└── frontend/
    ├── node_modules/
    ├── src/
    │   ├── api/
    │   │   └── client.ts
    │   ├── components/
    │   ├── hooks/
    │   │   └── useAuth.tsx
    │   ├── pages/
    │   │   ├── DashboardPage.tsx
    │   │   └── LoginPage.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package-lock.json
    └── package.json
```

---

# Environment Variables

Backend `.env`

```env
PORT=5000
JWT_SECRET=supersecretkey
```

---

# Final Notes

This project was designed to demonstrate:
- full-stack architecture
- REST API design
- JWT authentication
- relational database modeling
- React dashboard development
- TypeScript usage
- clean code structure
- practical engineering trade-offs

The implementation prioritised:
- simplicity
- readability
- maintainability
- scalability
- developer experience