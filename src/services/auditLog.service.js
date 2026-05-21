const prisma = require('../config/database');
const { parsePagination, paginated } = require('../utils/pagination');

async function list(actor, query) {
  const { limit, cursor } = parsePagination(query);
  const data = await prisma.auditLog.findMany({
    where: {
      tenantId: actor.role === 'PLATFORM_ADMIN' ? undefined : actor.tenantId,
      entityType: query.entityType || undefined
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });

  return paginated(data, limit);
}

module.exports = { list };
