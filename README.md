# LeanStock Final Production JS

LeanStock is a full-stack multi-tenant inventory management system for small retail chains.

## Stack

Backend:
- Node.js + Express.js
- Prisma ORM
- PostgreSQL 15+
- Redis
- BullMQ workers
- JWT authentication and refresh tokens
- RBAC
- Swagger/OpenAPI

Frontend:
- React
- Vite
- Axios
- Functional browser demo UI

## Main Features

- Owner registration
- Email verification
- Login / logout
- Refresh tokens
- Password reset support
- RBAC roles: OWNER, MANAGER, CASHIER, INVENTORY_CLERK, PLATFORM_ADMIN
- Product CRUD
- Location management
- Inventory receiving
- Atomic inter-location transfers
- Redis locks for inventory operations
- Reservation system
- Sales confirmation
- Dead stock background worker
- Reorder forecasting
- Audit logs
- BullMQ queue dashboard
- Swagger UI
- Docker Compose full stack

## Run Full Stack Locally

```bash
cp .env.example .env
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:3000
Swagger: http://localhost:3000/docs
Bull Dashboard: http://localhost:3000/admin/queues

## Local Backend Only

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Worker:

```bash
npm run worker
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Deployment Notes

Required production environment variables:
- DATABASE_URL
- REDIS_URL
- JWT_ACCESS_SECRET
- JWT_REFRESH_SECRET
- EMAIL_API_KEY
- EMAIL_FROM_ADDRESS
- BACKEND_PORT
- FRONTEND_PORT
- NODE_ENV
- CORS_ORIGINS

For Docker Compose deployment, use service names:
- postgres
- redis

Example:
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/leanstock_final?schema=public
REDIS_URL=redis://redis:6379

## Defense Demo Flow

1. Open frontend.
2. Register owner.
3. Show verification email job in worker or real provider.
4. Verify email.
5. Login.
6. Create locations.
7. Create product.
8. Receive stock.
9. Transfer stock.
10. Create reservation.
11. Confirm sale.
12. Show audit logs.
13. Show Bull Dashboard.
14. Show Swagger.
15. Show Prisma schema.
16. Run tests.

## Architecture Notes

All database access uses Prisma ORM. No raw SQL is used in application logic.
Business data is scoped by tenantId. Inventory mutations use Prisma transactions and Redis locks. BullMQ handles async email and background jobs.
