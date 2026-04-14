const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// middleware
app.use(bodyParser.urlencoded({ extended: false }));

// database connection
const db = mysql.createConnection({
  host: "mysql-37610bae-jeromequijano17-df99.l.aivencloud.com",
  user: "jerome",
  password: "AVNS_-YAxsM4LYuR2M5SLjeq",
  database: "crud_db",
  port: 23687
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Connected to MySQL");
  }
});


// READ (Display students)
app.get("/", (req, res) => {

  db.query("SELECT * FROM students", (err, results) => {

    let html = `
    <h1>Student CRUD System</h1>

    <h2>Add Student</h2>

    <form method="POST" action="/add">
      Name: <input name="stud_name" required><br>
      Address: <input name="stud_address" required><br>
      Age: <input name="age" required><br>
      <button>Add Student</button>
    </form>

    <h2>Student List</h2>

    <table border="1">
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Address</th>
      <th>Age</th>
      <th>Actions</th>
    </tr>
    `;

    results.forEach(student => {

      html += `
      <tr>
        <td>${student.stud_id}</td>
        <td>${student.stud_name}</td>
        <td>${student.stud_address}</td>
        <td>${student.age}</td>

        <td>
          <a href="/edit/${student.stud_id}">Edit</a>
          <a href="/delete/${student.stud_id}">Delete</a>
        </td>
      </tr>
      `;
    });

    html += "</table>";

    res.send(html);

  });

});


// CREATE
app.post("/add", (req, res) => {

  const { stud_name, stud_address, age } = req.body;

  db.query(
    "INSERT INTO students (stud_name, stud_address, age) VALUES (?, ?, ?)",
    [stud_name, stud_address, age],
    () => res.redirect("/")
  );

});


// EDIT PAGE
app.get("/edit/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "SELECT * FROM students WHERE stud_id = ?",
    [id],
    (err, results) => {

      const student = results[0];

      res.send(`
        <h2>Edit Student</h2>

        <form method="POST" action="/update/${id}">
          Name: <input name="stud_name" value="${student.stud_name}"><br>
          Address: <input name="stud_address" value="${student.stud_address}"><br>
          Age: <input name="age" value="${student.age}"><br>
          <button>Update</button>
        </form>
      `);

    }
  );

});


// UPDATE
app.post("/update/:id", (req, res) => {

  const id = req.params.id;
  const { stud_name, stud_address, age } = req.body;

  db.query(
    "UPDATE students SET stud_name=?, stud_address=?, age=? WHERE stud_id=?",
    [stud_name, stud_address, age, id],
    () => res.redirect("/")
  );

});


// DELETE
app.get("/delete/:id", (req, res) => {

  const id = req.params.id;

  db.query(
    "DELETE FROM students WHERE stud_id=?",
    [id],
    () => res.redirect("/")
  );

});


// START SERVER
app.listen(PORT, () => {
  console.log("Server running on port 3000");
});
