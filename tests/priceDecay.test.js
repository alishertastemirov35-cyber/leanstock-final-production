const { calculateDeadStockPrice, calculateReorderPoint } = require('../src/utils/priceDecay');

describe('price decay and forecasting formulas', () => {
  test('dead stock price decays by configurable percent', () => {
    expect(calculateDeadStockPrice(1000, 500, 10)).toBe(900);
    expect(calculateDeadStockPrice(520, 500, 10)).toBe(500);
  });

  test('reorder point uses moving average formula', () => {
    expect(calculateReorderPoint(3, 7, 5)).toBe(26);
  });
});
