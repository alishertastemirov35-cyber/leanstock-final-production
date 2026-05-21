const { Worker } = require('bullmq');
const redis = require('../config/redis');
const { sendEmail } = require('../services/email.service');
const { runDeadStockDecay } = require('../services/deadStock.service');

const emailWorker = new Worker('emailQueue', async (job) => {
  await sendEmail(job.data);
}, {
  connection: redis,
  attempts: 3
});

const jobsWorker = new Worker('jobsQueue', async (job) => {
  if (job.name === 'deadStockDecay') {
    return runDeadStockDecay();
  }
}, {
  connection: redis,
  attempts: 3
});

emailWorker.on('completed', job => console.log(`Email job completed: ${job.id}`));
emailWorker.on('failed', (job, err) => console.error(`Email job failed: ${job.id}`, err.message));

jobsWorker.on('completed', job => console.log(`Business job completed: ${job.id}`));
jobsWorker.on('failed', (job, err) => console.error(`Business job failed: ${job.id}`, err.message));

console.log('LeanStock workers started');
