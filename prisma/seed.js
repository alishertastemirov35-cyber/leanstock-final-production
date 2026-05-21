const bcrypt = require('bcryptjs');
const prisma = require('../src/config/database');

async function main() {
  const passwordHash = await bcrypt.hash('Admin12345!', 12);

  const tenant = await prisma.tenant.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Demo Market'
    }
  });

  await prisma.user.upsert({
    where: { email: 'owner@demo.kz' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'owner@demo.kz',
      fullName: 'Demo Owner',
      passwordHash,
      role: 'OWNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date()
    }
  });

  console.log('Seed completed: owner@demo.kz / Admin12345!');
}

main().finally(() => prisma.$disconnect());
