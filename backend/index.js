console.log("🔥 CORRECT SERVER FILE LOADED 🔥");

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});

// ================= DB TEST =================
pool.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.error("DB Error ❌", err));

// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.rows[0].password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json(user.rows[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= SUBJECTS =================

// ADD SUBJECT
app.post("/subjects", async (req, res) => {
  try {
    const { user_id, name } = req.body;

    const subject = await pool.query(
      "INSERT INTO subjects (user_id, name) VALUES ($1, $2) RETURNING *",
      [user_id, name]
    );

    res.json(subject.rows[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET SUBJECTS
app.get("/subjects/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const subjects = await pool.query(
      "SELECT * FROM subjects WHERE user_id = $1",
      [userId]
    );

    res.json(subjects.rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 DELETE SUBJECT
app.delete("/subjects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM subjects WHERE id = $1", [id]);

    res.json({ message: "Subject deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= TOPICS =================

// ADD TOPIC
app.post("/topics", async (req, res) => {
  try {
    const { subject_id, name } = req.body;

    const topic = await pool.query(
      "INSERT INTO topics (subject_id, name) VALUES ($1, $2) RETURNING *",
      [subject_id, name]
    );

    res.json(topic.rows[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET TOPICS
app.get("/topics/:subjectId", async (req, res) => {
  try {
    const { subjectId } = req.params;

    const topics = await pool.query(
      "SELECT * FROM topics WHERE subject_id = $1",
      [subjectId]
    );

    res.json(topics.rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 DELETE TOPIC
app.delete("/topics/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM topics WHERE id = $1", [id]);

    res.json({ message: "Topic deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= TASKS =================

// ADD TASK
app.post("/tasks", async (req, res) => {
  try {
    const { topic_id, title } = req.body;

    const task = await pool.query(
      "INSERT INTO tasks (topic_id, title) VALUES ($1, $2) RETURNING *",
      [topic_id, title]
    );

    res.json(task.rows[0]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET TASKS
app.get("/tasks/:topicId", async (req, res) => {
  try {
    const { topicId } = req.params;

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE topic_id = $1",
      [topicId]
    );

    res.json(tasks.rows);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔥 DELETE TASK
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    res.json({ message: "Task deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});