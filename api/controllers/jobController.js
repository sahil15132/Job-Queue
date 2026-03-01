const jobQueue = require("../queue/jobQueue");
const Job = require("../models/Job");

/* ------------------ CREATE JOB (now + delayed) ------------------ */
exports.createJob = async (req, res) => {
  const { type, payload, delay = 0 } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: "type and payload required" });
  }

  const runAt = new Date(Date.now() + delay);

  const job = await Job.create({
    type,
    payload,
    status: "pending",
    runAt
  });

  if (delay > 0) {
    await jobQueue.addDelayed(job._id, runAt);
  } else {
    await jobQueue.addNow(job._id);
  }

  res.status(201).json({
    jobId: job._id,
    status: job.status
  });
};


/* ------------------ JOB STATUS ------------------ */
exports.getJobStatus = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      id: job._id,
      type: job.type,
      status: job.status,
      attempts: job.attempts,
      maxAttempts: job.maxAttempts,
      lastError: job.lastError,
      runAt: job.runAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ------------------ GET FULL JOB ------------------ */
exports.getJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) return res.status(404).json({ error: "Job not found" });

  res.json(job);
};