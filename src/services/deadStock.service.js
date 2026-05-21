const prisma = require('../config/database');
const env = require('../config/env');
const { calculateDeadStockPrice } = require('../utils/priceDecay');

async function runDeadStockDecay() {
  const now = new Date();
  const olderThan = new Date(now.getTime() - env.DEAD_STOCK_DAYS * 24 * 60 * 60 * 1000);
  const discountBefore = new Date(now.getTime() - env.DEAD_STOCK_DECAY_INTERVAL_HOURS * 60 * 60 * 1000);

  const stocks = await prisma.inventoryStock.findMany({
    where: {
      quantityOnHand: { gt: 0 },
      oldestReceivedAt: { lt: olderThan },
      OR: [
        { lastDiscountAt: null },
        { lastDiscountAt: { lt: discountBefore } }
      ],
      product: { status: 'ACTIVE' }
    },
    include: { product: true }
  });

  const results = [];

  for (const stock of stocks) {
    const oldPrice = Number(stock.product.sellingPrice);
    const newPrice = calculateDeadStockPrice(
      stock.product.sellingPrice,
      stock.product.minimumPrice,
      env.DEAD_STOCK_DECAY_PERCENT
    );

    if (newPrice >= oldPrice) continue;

    const updated = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: stock.productId },
        data: { sellingPrice: newPrice }
      });

      await tx.inventoryStock.update({
        where: { id: stock.id },
        data: { lastDiscountAt: now }
      });

      await tx.priceHistory.create({
        data: {
          tenantId: stock.tenantId,
          productId: stock.productId,
          oldPrice,
          newPrice,
          reason: 'DEAD_STOCK_DECAY'
        }
      });

      await tx.auditLog.create({
        data: {
          tenantId: stock.tenantId,
          action: 'DEAD_STOCK_PRICE_DECAY',
          entityType: 'Product',
          entityId: stock.productId,
          oldValue: { sellingPrice: oldPrice },
          newValue: { sellingPrice: newPrice }
        }
      });

      return product;
    });

    results.push(updated);
  }

  return { updatedCount: results.length, products: results };
}

module.exports = { runDeadStockDecay };
