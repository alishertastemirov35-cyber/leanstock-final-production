const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const env = require('../config/env');
const emailQueue = require('../queues/email.queue');
const { randomCode } = require('../utils/tokens');
const { conflict, forbidden } = require('../utils/errors');

async function createUser(actor, data) {
  if (data.role === 'PLATFORM_ADMIN') {
    throw forbidden('Tenant owners cannot create platform admins');
  }

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw conflict('Email already exists');

  const code = randomCode();
  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      tenantId: actor.tenantId,
      email: data.email,
      fullName: data.fullName,
      passwordHash,
      role: data.role,
      status: 'PENDING_VERIFICATION',
      verificationCode: code,
      verificationExpires: new Date(Date.now() + 15 * 60 * 1000)
    }
  });

  await emailQueue.add('sendEmail', {
    to: user.email,
    subject: 'You were invited to LeanStock',
    html: `<p>You were invited as ${user.role}. Verification code: <b>${code}</b></p>`
  });

  return user;
}

async function listUsers(actor) {
  return prisma.user.findMany({
    where: { tenantId: actor.tenantId },
    select: { id: true, email: true, fullName: true, role: true, status: true, createdAt: true }
  });
}

module.exports = { createUser, listUsers };
