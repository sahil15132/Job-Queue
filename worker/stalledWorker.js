require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");
const jobQueue = require("../api/queue/jobQueue");

const CHECK_EVERY = 10000; // 10 sec
const STUCK_TIME = 60 * 1000; // 1 min

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Stalled worker running...");

  setInterval(async () => {

    const cutoff = new Date(Date.now() - STUCK_TIME);

    const stuckJobs = await Job.find({
      status: "processing",
      updatedAt: { $lt: cutoff }
    });

    for (const job of stuckJobs) {

      if (job.attempts >= job.maxAttempts) {
        await Job.findByIdAndUpdate(job._id, {
          status: "failed"
        });
        continue;
      }

      await Job.findByIdAndUpdate(job._id, {
        status: "pending"
      });

      await jobQueue.addNow(job._id);

      console.log("Requeued stuck job:", job._id);
    }

  }, CHECK_EVERY);
})();