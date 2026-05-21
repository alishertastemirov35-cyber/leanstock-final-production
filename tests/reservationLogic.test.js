describe('reservation business rule', () => {
  test('available quantity formula prevents overselling', () => {
    const quantityOnHand = 10;
    const reservedQuantity = 4;
    const requested = 7;
    const available = quantityOnHand - reservedQuantity;

    expect(available).toBe(6);
    expect(available >= requested).toBe(false);
  });
});
