const prisma = require('../config/database');
const { conflict, notFound } = require('../utils/errors');
const { parsePagination, paginated } = require('../utils/pagination');

async function create(actor, data) {
  const exists = await prisma.location.findUnique({
    where: { tenantId_name: { tenantId: actor.tenantId, name: data.name } }
  });
  if (exists) throw conflict('Location name already exists');

  return prisma.location.create({
    data: { ...data, tenantId: actor.tenantId }
  });
}

async function list(actor, query) {
  const { limit, cursor } = parsePagination(query);
  const data = await prisma.location.findMany({
    where: { tenantId: actor.tenantId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });

  return paginated(data, limit);
}

async function get(actor, id) {
  const location = await prisma.location.findFirst({ where: { id, tenantId: actor.tenantId } });
  if (!location) throw notFound('Location not found');
  return location;
}

module.exports = { create, list, get };
