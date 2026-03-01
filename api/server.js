require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { createClient } = require("redis");
const Job = require("./models/Job");

const app = express();
app.use(express.json());

(async () => {

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Mongo connected");

  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();
  console.log("Redis connected");

  // create job
  app.post("/jobs", async (req, res) => {

    const { type, payload } = req.body;

    const job = await Job.create({
      type,
      payload
    });

    await redis.lPush("job_queue", job._id.toString());

    res.json({
      id: job._id,
      status: job.status
    });
  });

  // job status
  app.get("/jobs/:id", async (req, res) => {

    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Not found" });

    res.json(job);
  });

  app.listen(5000, () => {
    console.log("API running on 5000");
  });

})();