const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL
});

client.connect();

async function addDelayed(jobId, runAt) {
  await client.zAdd("delayed_jobs", [{
    score: runAt.getTime(),
    value: jobId.toString()
  }]);
}

module.exports = { addDelayed };