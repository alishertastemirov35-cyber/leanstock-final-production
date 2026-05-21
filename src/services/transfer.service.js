const prisma = require('../config/database');
const redis = require('../config/redis');
const audit = require('./audit.service');
const emailQueue = require('../queues/email.queue');
const { badRequest, conflict, notFound } = require('../utils/errors');

async function transfer(actor, data, ipAddress) {
  if (data.sourceLocationId === data.destinationLocationId) {
    throw badRequest('Source and destination locations must be different');
  }

  const lockKey = `lock:transfer:${actor.tenantId}:${data.productId}`;
  const lock = await redis.set(lockKey, actor.id, 'EX', 10, 'NX');
  if (!lock) throw conflict('Inventory is locked by another operation');

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: data.productId, tenantId: actor.tenantId, status: 'ACTIVE' }
      });
      if (!product) throw notFound('Product not found');

      const sourceLocation = await tx.location.findFirst({
        where: { id: data.sourceLocationId, tenantId: actor.tenantId, status: 'ACTIVE' }
      });
      if (!sourceLocation) throw notFound('Source location not found');

      const destinationLocation = await tx.location.findFirst({
        where: { id: data.destinationLocationId, tenantId: actor.tenantId, status: 'ACTIVE' }
      });
      if (!destinationLocation) throw notFound('Destination location not found');

      const source = await tx.inventoryStock.findFirst({
        where: {
          tenantId: actor.tenantId,
          productId: data.productId,
          locationId: data.sourceLocationId
        }
      });

      const available = source ? source.quantityOnHand - source.reservedQuantity : 0;
      if (available < data.quantity) {
        throw conflict('Insufficient available stock', { available, requested: data.quantity });
      }

      const updatedSource = await tx.inventoryStock.update({
        where: { id: source.id },
        data: { quantityOnHand: { decrement: data.quantity } }
      });

      const updatedDestination = await tx.inventoryStock.upsert({
        where: {
          tenantId_productId_locationId: {
            tenantId: actor.tenantId,
            productId: data.productId,
            locationId: data.destinationLocationId
          }
        },
        create: {
          tenantId: actor.tenantId,
          productId: data.productId,
          locationId: data.destinationLocationId,
          quantityOnHand: data.quantity,
          oldestReceivedAt: new Date()
        },
        update: { quantityOnHand: { increment: data.quantity } }
      });

      await tx.inventoryMovement.createMany({
        data: [
          {
            tenantId: actor.tenantId,
            productId: data.productId,
            locationId: data.sourceLocationId,
            type: 'TRANSFER_OUT',
            quantityChange: -data.quantity,
            quantityAfter: updatedSource.quantityOnHand,
            createdById: actor.id,
            note: `Transfer to ${destinationLocation.name}`
          },
          {
            tenantId: actor.tenantId,
            productId: data.productId,
            locationId: data.destinationLocationId,
            type: 'TRANSFER_IN',
            quantityChange: data.quantity,
            quantityAfter: updatedDestination.quantityOnHand,
            createdById: actor.id,
            note: `Transfer from ${sourceLocation.name}`
          }
        ]
      });

      return { product, sourceLocation, destinationLocation, quantity: data.quantity };
    });

    await audit.log({
      tenantId: actor.tenantId,
      actorId: actor.id,
      action: 'INVENTORY_TRANSFERRED',
      entityType: 'InventoryStock',
      entityId: data.productId,
      newValue: data,
      ipAddress
    });

    await emailQueue.add('sendEmail', {
      to: actor.email,
      subject: 'LeanStock transfer completed',
      html: `<p>Transfer completed: ${result.quantity} units of ${result.product.name} from ${result.sourceLocation.name} to ${result.destinationLocation.name}.</p>`
    });

    return result;
  } finally {
    await redis.del(lockKey);
  }
}

module.exports = { transfer };
