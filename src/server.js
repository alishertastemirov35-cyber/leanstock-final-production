const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/database');
const redis = require('./config/redis');

const server = app.listen(env.PORT, () => {
  console.log(`LeanStock API running on http://localhost:${env.PORT}`);
  console.log(`Swagger UI: http://localhost:${env.PORT}/docs`);
});

async function shutdown() {
  console.log('Graceful shutdown...');
  await prisma.$disconnect();
  await redis.quit();
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
