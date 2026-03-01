require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");
const { addNow } = require("./queue/jobQueue");

const STALE_TIME = 60 * 1000; // 1 minute

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Recovery worker started");

  setInterval(async () => {
    const cutoff = new Date(Date.now() - STALE_TIME);

    const stuckJobs = await Job.find({
      status: "processing",
      lockedAt: { $lt: cutoff }
    });

    for (const job of stuckJobs) {
      console.log("Recovering job", job._id);

      await Job.findByIdAndUpdate(job._id, {
        status: "pending",
        lockedAt: null
      });

      await addNow(job._id);
    }
  }, 15000); // every 15 sec
})();