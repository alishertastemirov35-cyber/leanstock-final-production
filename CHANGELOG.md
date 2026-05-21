# CHANGELOG

## Final Milestone

Implemented:
- Complete auth lifecycle
- Email verification
- Password reset
- Refresh token rotation
- RBAC for all roles
- Multi-tenant products and locations
- Inventory receiving
- Atomic inventory transfers
- Redis checkout reservations
- Sale confirmation
- Dead stock decay worker
- Email queue
- Swagger documentation
- Unit tests
- CI workflow

Architectural note:
The assignment requires no raw SQL. Therefore, inventory transfer protection uses Prisma transactions plus Redis locks instead of direct SELECT FOR UPDATE.
