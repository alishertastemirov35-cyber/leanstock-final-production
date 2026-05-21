const rbac = require('../src/middleware/rbac');

describe('RBAC middleware', () => {
  test('rejects wrong role with 403', () => {
    const req = { user: { role: 'CASHIER' } };
    const res = {};
    const next = jest.fn();

    rbac('OWNER')(req, res, next);

    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  test('allows correct role', () => {
    const req = { user: { role: 'OWNER' } };
    const res = {};
    const next = jest.fn();

    rbac('OWNER')(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
