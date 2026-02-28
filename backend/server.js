const express = require("express");
const app = express();
const pool = require("./db");

app.use(express.json()); 
const cors = require("cors");
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
pool.connect()
  .then(() => console.log("Database Connected ✅"))
  .catch(err => console.error("DB Error ❌", err));

  app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, password]
    );

    res.json(newUser.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});