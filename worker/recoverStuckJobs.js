require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");
const { addNow } = require("./queue/jobQueue");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const timeout = 60 * 1000; // 1 minute
  const threshold = new Date(Date.now() - timeout);

  const stuckJobs = await Job.find({
    status: "processing",
    processingAt: { $lt: threshold }
  });

  for (const job of stuckJobs) {
    console.log("Re-queueing stuck job:", job._id.toString());

    await Job.findByIdAndUpdate(job._id, {
      status: "pending",
      processingAt: null
    });

    await addNow(job._id.toString());
  }

  process.exit(0);
})();