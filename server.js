const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "AVNS_-",
  database: "simpledb",
  port: 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect(err => {
  if (err) {
    console.log("DB connection failed:", err);
  } else {
    console.log("Connected to MySQL!");
  }
});

// Home page (form + data)
app.get("/", (req, res) => {
  db.query("SELECT * FROM messages", (err, results) => {
    if (err) return res.send("Database error");

    let html = `
      <h1>Simple Node.js + MySQL Website</h1>

      <form method="POST" action="/add">
        <input type="text" name="message" placeholder="Enter message" required />
        <button type="submit">Save</button>
      </form>

      <h2>Messages:</h2>
      <ul>
    `;

    results.forEach(row => {
      html += `<li>${row.message}</li>`;
    });

    html += `</ul>`;

    res.send(html);
  });
});

// Add message
app.post("/add", (req, res) => {
  const message = req.body.message;

  db.query("INSERT INTO messages (message) VALUES (?)", [message], (err) => {
    if (err) return res.send("Insert error");

    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
