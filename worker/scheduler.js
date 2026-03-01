require("dotenv").config();
const { createClient } = require("redis");

(async () => {
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  console.log("Delayed job scheduler running...");

  while (true) {
    const now = Date.now();

    const jobs = await redis.zRangeByScore(
      "delayed_jobs",
      0,
      now,
      { LIMIT: { offset: 0, count: 10 } }
    );

    for (const jobId of jobs) {
      await redis.lPush("job_queue", jobId);
      await redis.zRem("delayed_jobs", jobId);

      console.log("Moved delayed job:", jobId);
    }

    await new Promise(r => setTimeout(r, 1000));
  }
})();