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
    if (err) console.log("Database connection failed");
    else console.log("Connected to MySQL");
});


/* ======================
   MOBILE LEGENDS UI STYLE
====================== */

const style = `
<style>

body{
font-family: 'Segoe UI';
background: linear-gradient(135deg,#020024,#090979,#000);
color:white;
padding:20px;
margin:0;
}

.container{
max-width:500px;
margin:auto;
background:rgba(0,0,0,0.75);
padding:25px;
border-radius:15px;
box-shadow:0 0 20px gold;
}

.title{
text-align:center;
font-size:26px;
color:gold;
margin-bottom:20px;
}

input{
width:100%;
padding:10px;
margin-top:5px;
margin-bottom:15px;
border-radius:10px;
border:none;
outline:none;
}

button{
width:100%;
padding:12px;
border:none;
border-radius:12px;
background:linear-gradient(to right,gold,orange);
font-weight:bold;
cursor:pointer;
transition:.3s;
}

button:hover{
transform:scale(1.05);
box-shadow:0 0 15px gold;
}

a{
color:gold;
text-decoration:none;
font-weight:bold;
}

.card{
background:rgba(0,0,0,0.8);
padding:15px;
margin-bottom:15px;
border-radius:10px;
box-shadow:0 0 10px #00c3ff;
}

.table-container{
overflow-x:auto;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th{
background:#111;
color:gold;
padding:10px;
}

td{
padding:10px;
border-bottom:1px solid #333;
}

.action-btn{
padding:6px 10px;
border-radius:6px;
background:gold;
color:black;
margin-right:5px;
}

</style>
`;


/* ======================
   HOME PAGE
====================== */

app.get("/", (req, res) => {

res.send(`
${style}

<div class="container">

<div class="title">
⚔️ GCash Transaction Log ⚔️
</div>

<form action="/save" method="POST">

Reference Number
<input name="reference_number" required>

Sender Name
<input name="sender_name" required>

Amount
<input type="number" step="0.01" name="amount" required>

<button>💾 SAVE TRANSACTION</button>

</form>

<br>

<center>
<a href="/records">📊 VIEW RECORDS</a>
</center>

</div>
`);
});


/* ======================
   CREATE
====================== */

app.post("/save", (req, res) => {

const { reference_number, sender_name, amount } = req.body;

const sql = `
INSERT INTO gcash_logs
(reference_number, sender_name, amount)
VALUES (?, ?, ?)
`;

db.query(sql,
[reference_number, sender_name, amount],

(err)=>{

if(err){

if(err.code==="ER_DUP_ENTRY"){
return res.send(style + `
<div class="container">
❌ Duplicate Reference Number<br><br>
<a href="/">Back</a>
</div>`);
}

return res.send("Error saving record");
}

res.send(style + `
<div class="container">
✅ Transaction Saved<br><br>
<a href="/">Back</a>
</div>`);

});
});


/* ======================
   READ RECORDS
====================== */

app.get("/records", (req, res) => {

db.query(
"SELECT * FROM gcash_logs ORDER BY transaction_date DESC",

(err, rows)=>{

if(err) return res.send("Error retrieving records");

let table = `
${style}

<div class="container">

<div class="title">
📊 Transaction Records
</div>

<div class="table-container">

<table>

<tr>
<th>ID</th>
<th>Reference</th>
<th>Sender</th>
<th>Amount</th>
<th>Date</th>
<th>Action</th>
</tr>
`;

rows.forEach(row=>{

table += `
<tr>

<td>${row.id}</td>
<td>${row.reference_number}</td>
<td>${row.sender_name}</td>
<td>₱${row.amount}</td>
<td>${row.transaction_date}</td>

<td>

<a class="action-btn"
href="/edit/${row.id}">
Edit
</a>

<a class="action-btn"
href="/delete/${row.id}"
onclick="return confirm('Delete record?')">
Delete
</a>

</td>

</tr>
`;
});

table += `

</table>

</div>

<br>

<center>
<a href="/">⬅ BACK</a>
</center>

</div>
`;

res.send(table);

});
});


/* ======================
   EDIT PAGE
====================== */

app.get("/edit/:id", (req, res) => {

const id = req.params.id;

db.query(
"SELECT * FROM gcash_logs WHERE id=?",
[id],

(err, rows)=>{

if(err) return res.send("Error");

const data = rows[0];

res.send(`

${style}

<div class="container">

<div class="title">
✏️ Edit Transaction
</div>

<form action="/update/${id}" method="POST">

Reference Number
<input name="reference_number"
value="${data.reference_number}" required>

Sender Name
<input name="sender_name"
value="${data.sender_name}" required>

Amount
<input type="number"
step="0.01"
name="amount"
value="${data.amount}" required>

<button>UPDATE</button>

</form>

<br>

<center>
<a href="/records">⬅ BACK</a>
</center>

</div>

`);

});
});


/* ======================
   UPDATE
====================== */

app.post("/update/:id",(req,res)=>{

const id=req.params.id;

const{
reference_number,
sender_name,
amount
}=req.body;

const sql=`
UPDATE gcash_logs
SET reference_number=?,
sender_name=?,
amount=?
WHERE id=?
`;

db.query(sql,
[reference_number,sender_name,amount,id],

(err)=>{

if(err){

if(err.code==="ER_DUP_ENTRY"){
return res.send("Duplicate Reference Number");
}

return res.send("Update Failed");
}

res.redirect("/records");

});
});


/* ======================
   DELETE
====================== */

app.get("/delete/:id",(req,res)=>{

const id=req.params.id;

db.query(
"DELETE FROM gcash_logs WHERE id=?",
[id],

(err)=>{

if(err) return res.send("Delete Failed");

res.redirect("/records");

});
});


app.listen(PORT,()=>{
console.log("Server running at http://localhost:"+PORT);
});
