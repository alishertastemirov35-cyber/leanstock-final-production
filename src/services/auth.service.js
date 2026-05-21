const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const env = require('../config/env');
const emailQueue = require('../queues/email.queue');
const { signAccessToken, signRefreshToken, hashToken, randomCode } = require('../utils/tokens');
const { badRequest, unauthorized, conflict, forbidden } = require('../utils/errors');

async function saveRefreshToken(user) {
  const tokenId = cryptoRandom();
  const refreshToken = signRefreshToken(user, tokenId);

  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  return refreshToken;
}

function cryptoRandom() {
  return require('crypto').randomUUID();
}

async function registerOwner(data) {
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw conflict('Email already registered');

  const code = randomCode();
  const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: { name: data.tenantName }
    });

    const user = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: data.email,
        fullName: data.fullName,
        passwordHash,
        role: 'OWNER',
        status: 'PENDING_VERIFICATION',
        verificationCode: code,
        verificationExpires: new Date(Date.now() + 15 * 60 * 1000)
      }
    });

    return { tenant, user };
  });

  await emailQueue.add('sendEmail', {
    to: result.user.email,
    subject: 'Verify your LeanStock account',
    html: `<p>Your LeanStock verification code is <b>${code}</b>.</p>`
  });

  return {
    message: 'Registration successful. Please verify your email.',
    userId: result.user.id
  };
}

async function verifyEmail({ email, code }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw badRequest('Invalid verification request');

  if (user.verificationCode !== code || !user.verificationExpires || user.verificationExpires < new Date()) {
    throw badRequest('Invalid or expired verification code');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
      verificationCode: null,
      verificationExpires: null
    }
  });

  return { message: 'Email verified successfully' };
}

async function login(data) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) throw unauthorized('Invalid email or password');

  if (user.status !== 'ACTIVE' || !user.emailVerifiedAt) {
    throw forbidden('Please verify your email before login');
  }

  const accessToken = signAccessToken(user);
  const refreshToken = await saveRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw unauthorized('Refresh token is required');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch (e) {
    throw unauthorized('Invalid refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: decoded.tokenId } });
  if (!stored || stored.revokedAt || stored.tokenHash !== hashToken(refreshToken) || stored.expiresAt < new Date()) {
    throw unauthorized('Refresh token revoked or expired');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.status !== 'ACTIVE') throw unauthorized('User is not active');

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() }
  });

  const newRefreshToken = await saveRefreshToken(user);
  const accessToken = signAccessToken(user);

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(refreshToken) {
  if (!refreshToken) return;

  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    await prisma.refreshToken.updateMany({
      where: { id: decoded.tokenId },
      data: { revokedAt: new Date() }
    });
  } catch (e) {
    return;
  }
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If the email exists, reset instructions were sent.' };

  const code = randomCode();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetCode: code,
      resetExpires: new Date(Date.now() + 15 * 60 * 1000)
    }
  });

  await emailQueue.add('sendEmail', {
    to: user.email,
    subject: 'LeanStock password reset',
    html: `<p>Your password reset code is <b>${code}</b>.</p>`
  });

  return { message: 'If the email exists, reset instructions were sent.' };
}

async function resetPassword(data) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || user.resetCode !== data.code || !user.resetExpires || user.resetExpires < new Date()) {
    throw badRequest('Invalid or expired reset code');
  }

  const passwordHash = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetCode: null,
      resetExpires: null
    }
  });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() }
  });

  return { message: 'Password reset successfully' };
}

module.exports = { registerOwner, verifyEmail, login, refresh, logout, forgotPassword, resetPassword };
