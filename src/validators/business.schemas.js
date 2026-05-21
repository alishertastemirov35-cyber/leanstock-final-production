const { z } = require('zod');

const uuid = z.string().uuid();

exports.createUser = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['OWNER', 'MANAGER', 'CASHIER', 'INVENTORY_CLERK'])
  }),
  query: z.any(),
  params: z.any()
});

exports.createProduct = z.object({
  body: z.object({
    sku: z.string().min(1),
    name: z.string().min(2),
    category: z.string().optional(),
    costPrice: z.number().nonnegative(),
    sellingPrice: z.number().nonnegative(),
    minimumPrice: z.number().nonnegative(),
    leadTimeDays: z.number().int().positive().optional(),
    safetyStock: z.number().int().nonnegative().optional()
  }),
  query: z.any(),
  params: z.any()
});

exports.updateProduct = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    category: z.string().optional(),
    sellingPrice: z.number().nonnegative().optional(),
    minimumPrice: z.number().nonnegative().optional(),
    leadTimeDays: z.number().int().positive().optional(),
    safetyStock: z.number().int().nonnegative().optional()
  }),
  query: z.any(),
  params: z.object({ id: uuid })
});

exports.idParam = z.object({
  body: z.any(),
  query: z.any(),
  params: z.object({ id: uuid })
});

exports.createLocation = z.object({
  body: z.object({
    name: z.string().min(2),
    address: z.string().optional()
  }),
  query: z.any(),
  params: z.any()
});

exports.receiveStock = z.object({
  body: z.object({
    productId: uuid,
    locationId: uuid,
    quantity: z.number().int().positive(),
    note: z.string().optional()
  }),
  query: z.any(),
  params: z.any()
});

exports.transfer = z.object({
  body: z.object({
    productId: uuid,
    sourceLocationId: uuid,
    destinationLocationId: uuid,
    quantity: z.number().int().positive()
  }),
  query: z.any(),
  params: z.any()
});

exports.reservation = z.object({
  body: z.object({
    locationId: uuid,
    items: z.array(z.object({
      productId: uuid,
      quantity: z.number().int().positive()
    })).min(1)
  }),
  query: z.any(),
  params: z.any()
});

exports.confirmSale = z.object({
  body: z.object({
    reservationId: uuid
  }),
  query: z.any(),
  params: z.any()
});
