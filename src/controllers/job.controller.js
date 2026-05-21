const jobsQueue = require('../queues/jobs.queue');
exports.runDeadStock = async (req, res) => {
  const job = await jobsQueue.add('deadStockDecay', {});
  res.status(202).json({ message: 'Dead stock job queued', jobId: job.id });
};
