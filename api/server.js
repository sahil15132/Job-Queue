require("dotenv").config();
const express = require("express");
const { createClient } = require("redis");
const connectDB = require("../config/db");
const Job = require("../models/Job");

const app = express();
app.use(express.json());

const redis = createClient({ url: process.env.REDIS_URL });

(async () => {
  await redis.connect();
  console.log("Redis connected");
})();

connectDB(process.env.MONGO_URI);

app.post("/jobs/create", async (req, res) => {
  const { type, payload } = req.body;

  const job = await Job.create({ type, payload });
  await redis.lPush("job_queue", job._id.toString());

  res.status(201).json({
    message: "Job created",
    jobId: job._id,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`API running on port ${process.env.PORT}`);
});
