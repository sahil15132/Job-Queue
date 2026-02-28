const { Queue } = require("bullmq");
const connection = require("./redis");

const jobQueue = new Queue("job-queue", {
  connection,
});

module.exports = jobQueue;

