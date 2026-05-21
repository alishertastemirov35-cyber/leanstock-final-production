const prisma = require('../config/database');
const redis = require('../config/redis');
const env = require('../config/env');
const { conflict, notFound, badRequest } = require('../utils/errors');

async function create(actor, data) {
  const location = await prisma.location.findFirst({
    where: { id: data.locationId, tenantId: actor.tenantId, status: 'ACTIVE' }
  });
  if (!location) throw notFound('Location not found');

  const lockKeys = data.items.map(i => `lock:reservation:${actor.tenantId}:${data.locationId}:${i.productId}`);

  for (const key of lockKeys) {
    const ok = await redis.set(key, actor.id, 'EX', 10, 'NX');
    if (!ok) {
      for (const k of lockKeys) await redis.del(k);
      throw conflict('Some products are locked by another checkout');
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const expiresAt = new Date(Date.now() + env.RESERVATION_TTL_SECONDS * 1000);

      const reservation = await tx.reservation.create({
        data: {
          tenantId: actor.tenantId,
          locationId: data.locationId,
          cashierId: actor.id,
          expiresAt
        }
      });

      for (const item of data.items) {
        if (item.quantity <= 0) throw badRequest('Quantity must be greater than zero');

        const product = await tx.product.findFirst({
          where: { id: item.productId, tenantId: actor.tenantId, status: 'ACTIVE' }
        });
        if (!product) throw notFound('Product not found');

        const stock = await tx.inventoryStock.findFirst({
          where: {
            tenantId: actor.tenantId,
            productId: item.productId,
            locationId: data.locationId
          }
        });

        const available = stock ? stock.quantityOnHand - stock.reservedQuantity : 0;
        if (available < item.quantity) {
          throw conflict('Insufficient stock for reservation', { productId: item.productId, available, requested: item.quantity });
        }

        await tx.inventoryStock.update({
          where: { id: stock.id },
          data: { reservedQuantity: { increment: item.quantity } }
        });

        await tx.reservationItem.create({
          data: {
            reservationId: reservation.id,
            productId: item.productId,
            quantity: item.quantity,
            priceSnapshot: product.sellingPrice
          }
        });
      }

      return tx.reservation.findUnique({
        where: { id: reservation.id },
        include: { items: true }
      });
    });
  } finally {
    for (const key of lockKeys) await redis.del(key);
  }
}

async function cancel(actor, reservationId) {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findFirst({
      where: { id: reservationId, tenantId: actor.tenantId, status: 'ACTIVE' },
      include: { items: true }
    });

    if (!reservation) throw notFound('Active reservation not found');

    for (const item of reservation.items) {
      await tx.inventoryStock.updateMany({
        where: {
          tenantId: actor.tenantId,
          productId: item.productId,
          locationId: reservation.locationId
        },
        data: { reservedQuantity: { decrement: item.quantity } }
      });

      const stock = await tx.inventoryStock.findFirst({
        where: { tenantId: actor.tenantId, productId: item.productId, locationId: reservation.locationId }
      });

      await tx.inventoryMovement.create({
        data: {
          tenantId: actor.tenantId,
          productId: item.productId,
          locationId: reservation.locationId,
          type: 'RESERVATION_RELEASE',
          quantityChange: item.quantity,
          quantityAfter: stock.quantityOnHand,
          createdById: actor.id,
          note: 'Reservation cancelled'
        }
      });
    }

    return tx.reservation.update({
      where: { id: reservation.id },
      data: { status: 'CANCELLED' },
      include: { items: true }
    });
  });
}

module.exports = { create, cancel };
