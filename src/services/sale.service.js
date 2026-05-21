const prisma = require('../config/database');
const emailQueue = require('../queues/email.queue');
const { notFound, conflict } = require('../utils/errors');

async function confirm(actor, reservationId) {
  const sale = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findFirst({
      where: { id: reservationId, tenantId: actor.tenantId, status: 'ACTIVE' },
      include: { items: true }
    });

    if (!reservation) throw notFound('Active reservation not found');
    if (reservation.expiresAt < new Date()) throw conflict('Reservation expired');

    let totalAmount = 0;

    for (const item of reservation.items) {
      totalAmount += Number(item.priceSnapshot) * item.quantity;

      const stock = await tx.inventoryStock.findFirst({
        where: {
          tenantId: actor.tenantId,
          productId: item.productId,
          locationId: reservation.locationId
        }
      });

      if (!stock || stock.reservedQuantity < item.quantity || stock.quantityOnHand < item.quantity) {
        throw conflict('Reserved stock is not available');
      }

      const updatedStock = await tx.inventoryStock.update({
        where: { id: stock.id },
        data: {
          quantityOnHand: { decrement: item.quantity },
          reservedQuantity: { decrement: item.quantity },
          lastSaleAt: new Date()
        }
      });

      await tx.inventoryMovement.create({
        data: {
          tenantId: actor.tenantId,
          productId: item.productId,
          locationId: reservation.locationId,
          type: 'SALE',
          quantityChange: -item.quantity,
          quantityAfter: updatedStock.quantityOnHand,
          createdById: actor.id,
          note: 'Sale confirmed'
        }
      });
    }

    const createdSale = await tx.sale.create({
      data: {
        tenantId: actor.tenantId,
        locationId: reservation.locationId,
        cashierId: actor.id,
        reservationId: reservation.id,
        totalAmount,
        items: {
          create: reservation.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.priceSnapshot,
            totalPrice: Number(item.priceSnapshot) * item.quantity
          }))
        }
      },
      include: { items: true }
    });

    await tx.reservation.update({
      where: { id: reservation.id },
      data: { status: 'CONFIRMED' }
    });

    return createdSale;
  });

  await emailQueue.add('sendEmail', {
    to: actor.email,
    subject: 'LeanStock sale confirmed',
    html: `<p>Sale confirmed. Total amount: ${sale.totalAmount} KZT.</p>`
  });

  return sale;
}

async function list(actor) {
  return prisma.sale.findMany({
    where: { tenantId: actor.tenantId },
    include: { items: true, location: true },
    orderBy: { createdAt: 'desc' }
  });
}

module.exports = { confirm, list };
