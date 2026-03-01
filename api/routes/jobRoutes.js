const express = require("express");
const router = express.Router();

const controller = require("../controllers/jobController");
const validateCreateJob = require("../middlewares/validateCreateJob");
const rateLimit = require("../middlewares/rateLimit");

router.post(
  "/jobs",
  rateLimit,
  validateCreateJob,
  controller.createJob
);

router.get("/jobs/:id", controller.getJobStatus);

module.exports = router;