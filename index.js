require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= JWT MIDDLEWARE ================= */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  });
};

/* ================= REGISTER ================= */

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= GET SUBJECT TREE ================= */

app.get("/subjects", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subjects = await pool.query(
      "SELECT * FROM subjects WHERE user_id = $1",
      [userId]
    );

    const result = [];

    for (let subject of subjects.rows) {

      const topics = await pool.query(
        "SELECT * FROM topics WHERE subject_id = $1",
        [subject.id]
      );

      const topicData = [];

      for (let topic of topics.rows) {

        const tasks = await pool.query(
          "SELECT * FROM tasks WHERE topic_id = $1 AND user_id = $2",
          [topic.id, userId]
        );

        topicData.push({
          ...topic,
          tasks: tasks.rows
        });
      }

      result.push({
        ...subject,
        topics: topicData
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD SUBJECT ================= */

app.post("/subjects", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const user_id = req.user.id;

    const newSubject = await pool.query(
      "INSERT INTO subjects (name, user_id) VALUES ($1, $2) RETURNING *",
      [name, user_id]
    );

    res.json(newSubject.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE SUBJECT ================= */

app.delete("/subjects/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM tasks WHERE topic_id IN (SELECT id FROM topics WHERE subject_id = $1) AND user_id = $2",
      [id, userId]
    );

    await pool.query(
      "DELETE FROM topics WHERE subject_id = $1",
      [id]
    );

    await pool.query(
      "DELETE FROM subjects WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    res.json({ message: "Subject deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD TOPIC ================= */

app.post("/topics", authenticateToken, async (req, res) => {
  try {
    const { name, subject_id } = req.body;

    const newTopic = await pool.query(
      "INSERT INTO topics (name, subject_id) VALUES ($1, $2) RETURNING *",
      [name, subject_id]
    );

    res.json(newTopic.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE TOPIC ================= */

app.put("/topics/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await pool.query(
      "UPDATE topics SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    res.json(updated.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE TOPIC ================= */

app.delete("/topics/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM tasks WHERE topic_id = $1 AND user_id = $2",
      [id, userId]
    );

    await pool.query(
      "DELETE FROM topics WHERE id = $1",
      [id]
    );

    res.json({ message: "Topic deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= ADD TASK ================= */

app.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const { title, topic_id } = req.body;
    const user_id = req.user.id;

    const newTask = await pool.query(
      "INSERT INTO tasks (title, topic_id, user_id, completed) VALUES ($1, $2, $3, false) RETURNING *",
      [title, topic_id, user_id]
    );

    res.json(newTask.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= UPDATE TASK ================= */

app.put("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const userId = req.user.id;

    const updated = await pool.query(
      "UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [completed, id, userId]
    );

    res.json(updated.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= DELETE TASK ================= */

app.delete("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});