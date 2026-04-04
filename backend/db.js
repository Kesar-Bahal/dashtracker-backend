require("dotenv").config(); // top pe
console.log("DB URL:", process.env.DATABASE_URL); 

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;