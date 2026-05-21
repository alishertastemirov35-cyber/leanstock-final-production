const prisma = require('../config/database');
const { calculateReorderPoint } = require('../utils/priceDecay');

async function reorder(actor, locationId, days = 30) {
  const stocks = await prisma.inventoryStock.findMany({
    where: { tenantId: actor.tenantId, locationId },
    include: { product: true }
  });

  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const recommendations = [];

  for (const stock of stocks) {
    const saleItems = await prisma.saleItem.findMany({
      where: {
        productId: stock.productId,
        sale: {
          tenantId: actor.tenantId,
          locationId,
          createdAt: { gte: from }
        }
      }
    });

    const sold = saleItems.reduce((sum, item) => sum + item.quantity, 0);
    const averageDailySales = sold / days;
    const reorderPoint = calculateReorderPoint(
      averageDailySales,
      stock.product.leadTimeDays,
      stock.product.safetyStock
    );

    const availableQuantity = stock.quantityOnHand - stock.reservedQuantity;

    if (availableQuantity <= reorderPoint) {
      recommendations.push({
        productId: stock.productId,
        sku: stock.product.sku,
        name: stock.product.name,
        availableQuantity,
        averageDailySales,
        reorderPoint,
        recommendedOrderQuantity: Math.ceil(reorderPoint - availableQuantity + stock.product.safetyStock)
      });
    }
  }

  return recommendations;
}

module.exports = { reorder };
