const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: false }));

// DATABASE CONNECTION
const db = mysql.createConnection({
    host: "mysql-37610bae-jeromequijano17-df99.l.aivencloud.com",
  user: "jerome",
  password: "AVNS_-YAxsM4LYuR2M5SLjeq",
  database: "gcash",
  port: 23687
});

db.connect(err => {
    if (err) {
        console.log("Database connection failed");
    } else {
        console.log("Connected to MySQL");
    }
});


// HOME PAGE
app.get("/", (req, res) => {

res.send(`
<h2>GCash Transaction Log System</h2>

<form action="/save" method="POST">

Reference Number:<br>
<input name="reference_number" required><br><br>

Sender Name:<br>
<input name="sender_name" required><br><br>

Amount:<br>
<input type="number" step="0.01" name="amount" required><br><br>

<button type="submit">Save Transaction</button>

</form>

<br>

<a href="/records">View Records</a>
`);
});


// CREATE TRANSACTION
app.post("/save", (req, res) => {

const { reference_number, sender_name, amount } = req.body;

const sql = `
INSERT INTO gcash_logs
(reference_number, sender_name, amount)
VALUES (?, ?, ?)
`;

db.query(sql,
[reference_number, sender_name, amount],

(err) => {

if (err) {

if (err.code === "ER_DUP_ENTRY") {
return res.send("❌ Duplicate Reference Number Not Allowed<br><a href='/'>Back</a>");
}

return res.send("Error saving record");
}

res.send("✅ Transaction Saved<br><a href='/'>Back</a>");

});

});


// READ TRANSACTIONS
app.get("/records", (req, res) => {

db.query("SELECT * FROM gcash_logs ORDER BY transaction_date DESC",

(err, rows) => {

if (err) {
return res.send("Error retrieving records");
}

let table = `
<h2>GCash Records</h2>

<table border="1" cellpadding="10">

<tr>
<th>ID</th>
<th>Reference</th>
<th>Sender</th>
<th>Amount</th>
<th>Date</th>
<th>Actions</th>
</tr>
`;

rows.forEach(row => {

table += `
<tr>

<td>${row.id}</td>
<td>${row.reference_number}</td>
<td>${row.sender_name}</td>
<td>${row.amount}</td>
<td>${row.transaction_date}</td>

<td>

<a href="/edit/${row.id}">Edit</a> |
<a href="/delete/${row.id}"
onclick="return confirm('Delete this record?')">
Delete
</a>

</td>

</tr>
`;

});

table += "</table><br><a href='/'>Back</a>";

res.send(table);

});

});


// EDIT PAGE
app.get("/edit/:id", (req, res) => {

const id = req.params.id;

db.query(
"SELECT * FROM gcash_logs WHERE id = ?",
[id],

(err, rows) => {

if (err) return res.send("Error");

const data = rows[0];

res.send(`

<h2>Edit Transaction</h2>

<form action="/update/${id}" method="POST">

Reference Number:<br>
<input name="reference_number"
value="${data.reference_number}" required><br><br>

Sender Name:<br>
<input name="sender_name"
value="${data.sender_name}" required><br><br>

Amount:<br>
<input type="number" step="0.01"
name="amount"
value="${data.amount}" required><br><br>

<button type="submit">Update</button>

</form>

<br>
<a href="/records">Back</a>

`);

});

});


// UPDATE TRANSACTION
app.post("/update/:id", (req, res) => {

const id = req.params.id;

const { reference_number, sender_name, amount } = req.body;

const sql = `
UPDATE gcash_logs
SET reference_number=?, sender_name=?, amount=?
WHERE id=?
`;

db.query(sql,
[reference_number, sender_name, amount, id],

(err) => {

if (err) {

if (err.code === "ER_DUP_ENTRY") {
return res.send("❌ Duplicate Reference Number Not Allowed");
}

return res.send("Update Failed");
}

res.redirect("/records");

});

});


// DELETE TRANSACTION
app.get("/delete/:id", (req, res) => {

const id = req.params.id;

db.query(
"DELETE FROM gcash_logs WHERE id=?",
[id],

(err) => {

if (err) return res.send("Delete Failed");

res.redirect("/records");

});

});


app.listen(PORT, () => {
console.log("Server running at http://localhost:" + PORT);
});
