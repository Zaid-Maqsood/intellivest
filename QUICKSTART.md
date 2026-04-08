# FinCopilot — Quick Start Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ (running locally)

---

## 1. Setup PostgreSQL

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE fincopilot;"
```

## 2. Configure Backend

```bash
# Backend is pre-configured in backend/.env
# Only update DB_PASSWORD if yours is different from "password"
# Paste your OpenAI key in OPENAI_API_KEY to enable real AI
# (Leave as-is for mock/demo mode)
```

## 3. Start Backend

```bash
cd backend
npm install
npm run seed     # Creates tables + seeds 10 clients, portfolios, etc.
npm start        # Starts API on http://localhost:5000
```

## 4. Start Frontend

```bash
cd frontend
npm install
npm run dev      # Starts app on http://localhost:5173
```

## 5. Login

Open http://localhost:5173

- **Email:** advisor@fincopilot.com  
- **Password:** password123

---

## Features

| Module | Route | Description |
|--------|-------|-------------|
| Dashboard | `/dashboard` | KPIs, AI actions, AUM chart |
| Clients | `/clients` | Search, filter, client cards |
| Client Profile | `/clients/:id` | Full profile with tabs |
| Portfolios | `/portfolios` | Charts, allocation, performance table |
| Financial Plans | `/plans` | AI plan generator |
| Tax Optimization | `/tax` | Loss harvesting, Roth conversion |
| Documents | `/documents` | Upload + AI document query |
| Analytics | `/analytics` | Monte Carlo simulation, risk model |
| Compliance | `/compliance` | Audit logs, resolve issues |
| Reports | `/reports` | AI report generator + download |

---

## AI Mode

- **Mock mode** (default): Returns realistic canned responses instantly. No API key needed.
- **Real AI mode**: Set `OPENAI_API_KEY` in `backend/.env` to use GPT-4o for real responses.

---

## API Endpoints

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me

GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id

GET    /api/portfolios
GET    /api/portfolios/:id

POST   /api/documents/upload
POST   /api/documents/query    (AI)
GET    /api/documents

GET    /api/ai/recommendations/:clientId
POST   /api/ai/plan
POST   /api/ai/report
GET    /api/ai/simulate/:clientId

GET    /api/tax/opportunities/:clientId
GET    /api/tax/summary

GET    /api/compliance/logs
PATCH  /api/compliance/logs/:id/resolve

GET    /api/analytics/summary
GET    /api/analytics/risk-model
GET    /api/analytics/simulate/:clientId
```
