function calculateDeadStockPrice(currentPrice, minimumPrice, decayPercent) {
  const current = Number(currentPrice);
  const minimum = Number(minimumPrice);
  const discounted = current * (1 - decayPercent / 100);
  return Math.max(minimum, Number(discounted.toFixed(2)));
}

function calculateReorderPoint(averageDailySales, leadTimeDays, safetyStock) {
  return averageDailySales * leadTimeDays + safetyStock;
}

module.exports = { calculateDeadStockPrice, calculateReorderPoint };
