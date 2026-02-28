const jobQueue = require("../queue/jobQueue");
const Job = require("../../models/Job");

exports.createJob = async (req, res) => {
  const { type, payload } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: "type and payload required" });
  }

  // Save job in DB
  const job = await Job.create({
    type,
    payload,
    status: "pending",
  });

  // Push job to Redis queue
  await jobQueue.add(type, {
    jobId: job._id,
    payload,
  });

  res.status(201).json({
    message: "Job created",
    jobId: job._id,
  });
};
