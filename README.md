# Job Queue System (Node + Redis + MongoDB)

A simple job queue system built with **Node.js**, **Redis**, and **MongoDB**.

It supports:

-  Immediate jobs  
-  Delayed jobs  
-  Retry logic  
-  Job status API  
-  Dead jobs queue  
-  Separate workers  

---

## 📦 Features

- REST API to create jobs
- Redis list for ready jobs
- Redis sorted set for delayed jobs
- MongoDB for job persistence & status
- Worker process to execute jobs
- Delayed worker to move scheduled jobs to ready queue
- Automatic retries with max attempts
- Dead queue for permanently failed jobs

---

## 🗂️ Project Structure

job-queue-system/
│
├── api/
│ ├── controllers/
│ │ └── jobController.js
│ ├── routes/
│ └── server.js
│
├── queue/
│ └── jobQueue.js
│
├── models/
│ └── Job.js
│
├── worker/
│ ├── worker.js
│ └── delayedWorker.js
│
└── .env

---

## ⚙️ Requirements

- Node.js
- Redis
- MongoDB

---

## 🔐 Environment variables

Create a `.env` file in both `api` and `worker` folders (or root, depending on how you load it):
MONGO_URI=mongodb://localhost:27017/jobqueue
REDIS_URL=redis://localhost:6379

---

## 📄 Job model

Each job stored in MongoDB contains:

- type
- payload
- status (pending / processing / completed / failed)
- attempts
- maxAttempts
- lastError
- runAt
- timestamps

---

## 🚀 How to run

### 1. Start Redis & MongoDB

If you use Docker for Redis:
docker run -d -p 6379:6379 --name redis redis

---

### 2. Start API

From the API folder:
node server.js

---

### 3. Start worker

From the worker folder:
node worker.js

---

### 4. Start delayed worker

From the worker folder:
node delayedWorker.js
---

## 🧪 Create a job

**POST**
/jobs
Body:

```json
{
  "type": "email",
  "payload": {
    "to": "test@test.com"
  },
  "delay": 5000
}

- delay is optional (milliseconds)
- If delay is provided, job is scheduled

🔍 Get job status
GET

/jobs/:id
Returns:

{
  "id": "...",
  "type": "email",
  "status": "completed",
  "attempts": 0,
  "maxAttempts": 3,
  "lastError": null,
  "createdAt": "...",
  "updatedAt": "..."
}

🧠 How the system works

Ready queue
job_queue

-Jobs ready to be processed.

Delayed queue
job_queue:delayed

-Redis sorted set containing:

score = runAt timestamp
value = jobId

Dead queue
job_queue:dead

-Jobs that exceeded max retry attempts.

🔁 Retry logic
When a job fails:

attempts is increased

if attempts < maxAttempts
→ job is re‑queued

otherwise
→ job is pushed to job_queue:dead

👷 worker.js
Pops jobs from job_queue

Marks job as processing

Executes work

Marks as completed or retries on failure

⏱️ delayedWorker.js
Polls job_queue:delayed

Moves due jobs to job_queue

🧱 This project is intentionally simple
This project is built only using:

Redis lists

Redis sorted sets

MongoDB

No external queue libraries are used.

It is meant to demonstrate how a basic job queue system works internally.

📌 Next possible improvements
Multiple job handlers by type

Job concurrency

Job cancellation

Priority queues

Dashboard UI

Graceful shutdown

Worker health checks


