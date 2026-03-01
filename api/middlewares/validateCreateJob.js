module.exports = function validateCreateJob(req, res, next) {
  const { type, payload, delay } = req.body;

  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "type must be a string" });
  }

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "payload must be an object" });
  }

  if (delay !== undefined && (typeof delay !== "number" || delay < 0)) {
    return res.status(400).json({ error: "delay must be a positive number" });
  }

  next();
};