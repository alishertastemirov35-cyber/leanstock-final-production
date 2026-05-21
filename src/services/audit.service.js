const prisma = require('../config/database');

async function log({ tenantId, actorId, action, entityType, entityId, oldValue, newValue, ipAddress }) {
  return prisma.auditLog.create({
    data: {
      tenantId,
      actorId,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress
    }
  });
}

module.exports = { log };
