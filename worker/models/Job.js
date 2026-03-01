const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  type: { type: String, required: true },
  payload: { type: Object, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
  processingAt: Date,

  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  lastError: String,

  runAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });
module.exports = mongoose.model("Job", jobSchema);