require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("../models/Job");
const { client, READY_QUEUE } = require("../queue/jobQueue");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startWorker() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Worker connected to MongoDB");

  if (!client.isOpen) {
    await client.connect();
  }

  console.log("Worker waiting for jobs...");

 while (!shuttingDown) {
    try {
      const result = await client.brPop(READY_QUEUE, 0);
      const jobId = result.element;

      const job = await Job.findById(jobId);

      if (!job) continue;

      // mark processing
      await Job.findByIdAndUpdate(jobId, {
        status: "processing",
        processingAt: new Date()
      });

      try {
        console.log(`Processing job ${jobId} (${job.type})`);

        // your real work goes here
        await sleep(2000);

        await Job.findByIdAndUpdate(jobId, {
          status: "completed",
          processingAt: null
        });

        console.log("Job completed:", jobId);

      } catch (err) {

        const updated = await Job.findByIdAndUpdate(
          jobId,
          {
            $inc: { attempts: 1 },
            lastError: err.message
          },
          { new: true }
        );

        if (updated.attempts < updated.maxAttempts) {

          console.log("Retrying job:", jobId);

          await Job.findByIdAndUpdate(jobId, {
            status: "pending"
          });

          await client.lPush(READY_QUEUE, jobId);

} else {

  await Job.findByIdAndUpdate(jobId, {
    status: "failed"
  });

  await redis.lPush("job_queue:dead", jobId);

  console.log("Job permanently failed:", jobId);
}
      }

    } catch (err) {
      console.error("Worker loop error:", err.message);
      await sleep(1000);
    }
  }
}
let shuttingDown = false;

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");

  shuttingDown = true;

  try {
    await mongoose.disconnect();
    await redis.quit();
  } catch (e) {}

  process.exit(0);
});

startWorker();