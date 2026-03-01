require("dotenv").config();
const mongoose = require("mongoose");
const Job = require("./models/Job");
const { addNow } = require("./queue/jobQueue");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Recovery worker started");

  setInterval(async () => {

    const timeout = new Date(Date.now() - 60 * 1000); // 1 minute

    const stuckJobs = await Job.find({
      status: "processing",
      lockedAt: { $lt: timeout }
    });

    for (const job of stuckJobs) {

      console.log("Recovering job:", job._id);

      await Job.findByIdAndUpdate(job._id, {
        status: "pending",
        lockedAt: null
      });

      await addNow(job._id);
    }

  }, 15000); // run every 15 sec

})();