const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  type: { type: String, required: true },
  payload: { type: Object, required: true },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Job", jobSchema);
