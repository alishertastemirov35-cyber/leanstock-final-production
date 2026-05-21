const prisma = require('../config/database');
const audit = require('./audit.service');
const { conflict, notFound } = require('../utils/errors');
const { parsePagination, paginated } = require('../utils/pagination');

async function create(actor, data, ipAddress) {
  const exists = await prisma.product.findUnique({
    where: { tenantId_sku: { tenantId: actor.tenantId, sku: data.sku } }
  });
  if (exists) throw conflict('SKU already exists in this tenant');

  const product = await prisma.product.create({
    data: { ...data, tenantId: actor.tenantId }
  });

  await audit.log({
    tenantId: actor.tenantId,
    actorId: actor.id,
    action: 'PRODUCT_CREATED',
    entityType: 'Product',
    entityId: product.id,
    newValue: product,
    ipAddress
  });

  return product;
}

async function list(actor, query) {
  const { limit, cursor } = parsePagination(query);
  const data = await prisma.product.findMany({
    where: {
      tenantId: actor.tenantId,
      status: query.status || undefined,
      name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  });
  return paginated(data, limit);
}

async function get(actor, id) {
  const product = await prisma.product.findFirst({ where: { id, tenantId: actor.tenantId } });
  if (!product) throw notFound('Product not found');
  return product;
}

async function update(actor, id, data, ipAddress) {
  const old = await get(actor, id);
  const updated = await prisma.product.update({
    where: { id },
    data
  });

  await audit.log({
    tenantId: actor.tenantId,
    actorId: actor.id,
    action: 'PRODUCT_UPDATED',
    entityType: 'Product',
    entityId: id,
    oldValue: old,
    newValue: updated,
    ipAddress
  });

  return updated;
}

async function archive(actor, id, ipAddress) {
  const old = await get(actor, id);
  const updated = await prisma.product.update({
    where: { id },
    data: { status: 'ARCHIVED', archivedAt: new Date() }
  });

  await audit.log({
    tenantId: actor.tenantId,
    actorId: actor.id,
    action: 'PRODUCT_ARCHIVED',
    entityType: 'Product',
    entityId: id,
    oldValue: old,
    newValue: updated,
    ipAddress
  });

  return updated;
}

module.exports = { create, list, get, update, archive };
