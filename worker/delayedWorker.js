require("dotenv").config();
const { createClient } = require("redis");

const READY_QUEUE = "job_queue";
const DELAYED_SET = "job_queue:delayed";

const redis = createClient({
  url: process.env.REDIS_URL
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  await redis.connect();

  console.log("Delayed worker started...");

  while (true) {
    const now = Date.now();

    const jobs = await redis.zRangeByScore(
      DELAYED_SET,
      0,
      now
    );

    for (const jobId of jobs) {
      // remove from delayed
      await redis.zRem(DELAYED_SET, jobId);

      // push to ready queue
      await redis.lPush(READY_QUEUE, jobId);

      console.log("Moved delayed job to queue:", jobId);
    }

    await sleep(1000); // check every 1 sec
  }
})();