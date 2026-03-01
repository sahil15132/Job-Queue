const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL
});

client.connect();

const READY_QUEUE = "job_queue";
const DELAYED_SET = "job_queue:delayed";

exports.addNow = async (jobId) => {
  await client.lPush(READY_QUEUE, jobId);
};

exports.addDelayed = async (jobId, runAt) => {
  await client.zAdd(DELAYED_SET, [
    {
      score: runAt.getTime(),
      value: jobId
    }
  ]);
};

exports.client = client;
exports.READY_QUEUE = READY_QUEUE;
exports.DELAYED_SET = DELAYED_SET;