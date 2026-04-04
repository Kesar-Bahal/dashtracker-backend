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

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );

    res.status(201).json(newUser.rows[0]);

  } catch (err) {
    console.log("🔥 REGISTER ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or Password missing" });
    }

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

    res.status(200).json(user.rows[0]);

  } catch (err) {
    console.log("🔥 LOGIN ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= TEST =================
app.get("/test", (req, res) => {
  res.send("Route working ✅");
});

// ================= SERVER =================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});