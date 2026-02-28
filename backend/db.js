const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "interview_tracker",
  password: "Kbahal11",
  port: 5432,
});

module.exports = pool;