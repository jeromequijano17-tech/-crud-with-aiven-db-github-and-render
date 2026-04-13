const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// Home page
app.get("/", (req, res) => {
  res.send("Hello! Your Node.js app is running on Render 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
