require("dotenv").config();
const { createClient } = require("redis");
const mongoose = require("mongoose");
const Job = require("../models/Job");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Worker connected to MongoDB");

  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  console.log("Worker is running and waiting for jobs...");

  while (true) {
    const result = await redis.brPop("job_queue", 0);
    const jobId = result.element;

    console.log("Processing job:", jobId);

    const job = await Job.findByIdAndUpdate(
      jobId,
      { status: "processing" },
      { new: true }
    );

    try {
      // 🔧 simulate work
      console.log(`Sending ${job.type} to`, job.payload.to);
      await new Promise(r => setTimeout(r, 2000));

      await Job.findByIdAndUpdate(jobId, { status: "completed" });
      console.log("Job completed:", jobId);
    } catch (err) {
      await Job.findByIdAndUpdate(jobId, { status: "failed" });
      console.error("Job failed:", jobId);
    }
  }
})();
