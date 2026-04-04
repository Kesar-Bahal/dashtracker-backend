console.log("🔥 CORRECT SERVER FILE LOADED 🔥");

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ================= ROOT =================
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// ================= DB TEST =================
pool.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.error("DB Error ❌", err));

// ================= AUTH =================

// REGISTER
app.post("/register", async (req, res) => {
  console.log("🔥 REGISTER BODY:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.log("🔥 REGISTER ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

// LOGIN
app.post("/login", async (req, res) => {

  console.log("🔥 LOGIN BODY:", req.body);

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password missing" });
    }

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log("🔥 USER FROM DB:", user.rows);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.rows[0].password !== password) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.json(user.rows[0]);

  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

// ================= SUBJECTS =================

app.post("/subjects", async (req, res) => {
  console.log("🔥 SUBJECT BODY:", req.body);

  try {
    const { user_id, name } = req.body;

    const subject = await pool.query(
      "INSERT INTO subjects (user_id, name) VALUES ($1, $2) RETURNING *",
      [user_id, name]
    );

    res.json(subject.rows[0]);
  } catch (err) {
    console.log("🔥 SUBJECT ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

app.get("/subjects/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const subjects = await pool.query(
      "SELECT * FROM subjects WHERE user_id = $1",
      [userId]
    );

    res.json(subjects.rows);
  } catch (err) {
    console.log("🔥 GET SUBJECT ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

// ================= TOPICS =================

app.post("/topics", async (req, res) => {
  try {
    const { subject_id, name } = req.body;

    const topic = await pool.query(
      "INSERT INTO topics (subject_id, name) VALUES ($1, $2) RETURNING *",
      [subject_id, name]
    );

    res.json(topic.rows[0]);
  } catch (err) {
    console.log("🔥 TOPIC ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

// ================= TASKS =================

app.post("/tasks", async (req, res) => {
  try {
    const { topic_id, title } = req.body;

    const task = await pool.query(
      "INSERT INTO tasks (topic_id, title) VALUES ($1, $2) RETURNING *",
      [topic_id, title]
    );

    res.json(task.rows[0]);
  } catch (err) {
    console.log("🔥 TASK ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE tasks SET completed = NOT completed WHERE id = $1",
      [id]
    );

    res.json({ message: "Task Updated" });
  } catch (err) {
    console.log("🔥 TASK UPDATE ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

app.put("/tasks/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    await pool.query(
      "UPDATE tasks SET title = $1 WHERE id = $2",
      [title, id]
    );

    res.json({ message: "Task Updated Successfully" });
  } catch (err) {
    console.log("🔥 TASK EDIT ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

// ================= USER =================

app.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await pool.query(
      "SELECT id, name, email, xp FROM users WHERE id = $1",
      [id]
    );

    res.json(user.rows[0]);
  } catch (err) {
    console.log("🔥 USER ERROR:", err.message);
    res.status(500).send(err.message);
  }
});

// ================= TEST =================

app.get("/test", (req, res) => {
  res.send("Route working ✅");
});
app.get("/", (req, res) => {
  res.send("Backend working 🚀");
});
// ================= SERVER =================

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});