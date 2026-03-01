const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL
});

client.connect();

const WINDOW = 60; // seconds
const LIMIT = 30;  // requests per window

module.exports = async function rateLimit(req, res, next) {

  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress;

  const key = `ratelimit:${ip}`;

  const count = await client.incr(key);

  if (count === 1) {
    await client.expire(key, WINDOW);
  }

  if (count > LIMIT) {
    return res.status(429).json({
      error: "Too many requests, slow down"
    });
  }

  next();
};