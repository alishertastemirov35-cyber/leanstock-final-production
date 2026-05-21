const { Queue } = require('bullmq');
const redis = require('../config/redis');

const jobsQueue = new Queue('jobsQueue', {
  connection: redis
});

module.exports = jobsQueue;
