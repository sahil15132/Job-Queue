require("dotenv").config();
const { createClient } = require("redis");

const redis = createClient({ url: process.env.REDIS_URL });

const QUEUE = "job_queue";
const DELAYED = "delayed_jobs";

(async () => {
  await redis.connect();

  console.log("Delayed job scheduler started");

  while (true) {

    const now = Date.now();

    const jobs = await redis.zRangeByScore(
      DELAYED,
      0,
      now,
      { LIMIT: { offset: 0, count: 10 } }
    );

    for (const jobId of jobs) {
      await redis.zRem(DELAYED, jobId);
      await redis.lPush(QUEUE, jobId);

      console.log("Moved delayed job to queue:", jobId);
    }

    await new Promise(r => setTimeout(r, 1000));
  }
})();