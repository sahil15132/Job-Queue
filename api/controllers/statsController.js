const Job = require("../models/Job");
const { client, READY_QUEUE, DELAYED_SET } = require("../queue/jobQueue");

exports.getStats = async (req, res) => {
  const [
    total,
    pending,
    processing,
    completed,
    failed,
    redisQueueLen,
    delayedCount
  ] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ status: "pending" }),
    Job.countDocuments({ status: "processing" }),
    Job.countDocuments({ status: "completed" }),
    Job.countDocuments({ status: "failed" }),
    client.lLen(READY_QUEUE),
    client.zCard(DELAYED_SET)
  ]);

  res.json({
    total,
    pending,
    processing,
    completed,
    failed,
    redisQueueLen,
    delayedCount
  });
};