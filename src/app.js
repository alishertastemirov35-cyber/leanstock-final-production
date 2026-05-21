require('./config/env');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { ExpressAdapter } = require('@bull-board/express');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');

const emailQueue = require('./queues/email.queue');
const jobsQueue = require('./queues/jobs.queue');
const swagger = require('./config/swagger');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const locationRoutes = require('./routes/location.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const transferRoutes = require('./routes/transfer.routes');
const reservationRoutes = require('./routes/reservation.routes');
const saleRoutes = require('./routes/sale.routes');
const forecastRoutes = require('./routes/forecast.routes');
const auditRoutes = require('./routes/audit.routes');
const jobRoutes = require('./routes/job.routes');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.use(cors({
  origin: env.NODE_ENV === 'production' ? [env.FRONTEND_URL] : [env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true
}));

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(emailQueue), new BullMQAdapter(jobsQueue)],
  serverAdapter
});

app.use('/admin/queues', serverAdapter.getRouter());
app.use('/docs', swagger.serve, swagger.setup);

app.get('/health', (req, res) => res.json({ ok: true, service: 'LeanStock' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/locations', locationRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/transfers', transferRoutes);
app.use('/api/v1/reservations', reservationRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/forecasts', forecastRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/jobs', jobRoutes);

app.use(errorHandler);

module.exports = app;
