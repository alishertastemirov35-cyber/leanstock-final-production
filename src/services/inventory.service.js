const prisma = require('../config/database');
const audit = require('./audit.service');
const { notFound, badRequest } = require('../utils/errors');

async function receive(actor, data, ipAddress) {
  if (data.quantity <= 0) throw badRequest('Quantity must be greater than zero');

  const product = await prisma.product.findFirst({ where: { id: data.productId, tenantId: actor.tenantId, status: 'ACTIVE' } });
  if (!product) throw notFound('Product not found');

  const location = await prisma.location.findFirst({ where: { id: data.locationId, tenantId: actor.tenantId, status: 'ACTIVE' } });
  if (!location) throw notFound('Location not found');

  return prisma.$transaction(async (tx) => {
    const stock = await tx.inventoryStock.upsert({
      where: {
        tenantId_productId_locationId: {
          tenantId: actor.tenantId,
          productId: data.productId,
          locationId: data.locationId
        }
      },
      create: {
        tenantId: actor.tenantId,
        productId: data.productId,
        locationId: data.locationId,
        quantityOnHand: data.quantity,
        oldestReceivedAt: new Date()
      },
      update: {
        quantityOnHand: { increment: data.quantity },
        oldestReceivedAt: new Date()
      }
    });

    await tx.inventoryMovement.create({
      data: {
        tenantId: actor.tenantId,
        productId: data.productId,
        locationId: data.locationId,
        type: 'RECEIVE',
        quantityChange: data.quantity,
        quantityAfter: stock.quantityOnHand,
        note: data.note,
        createdById: actor.id
      }
    });

    await audit.log({
      tenantId: actor.tenantId,
      actorId: actor.id,
      action: 'STOCK_RECEIVED',
      entityType: 'InventoryStock',
      entityId: stock.id,
      newValue: data,
      ipAddress
    });

    return stock;
  });
}

async function list(actor, query) {
  return prisma.inventoryStock.findMany({
    where: {
      tenantId: actor.tenantId,
      locationId: query.locationId || undefined,
      productId: query.productId || undefined
    },
    include: { product: true, location: true },
    orderBy: { updatedAt: 'desc' }
  });
}

module.exports = { receive, list };
