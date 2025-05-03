const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// GET home page
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// Serve audio file
router.get("/audio/:filename", (req, res) => {
  const filename = path.basename(req.params.filename); // Sanitize input
  const filePath = path.join(process.cwd(), "tmp", filename); // Use project root

  console.log("Looking for file at:", filePath);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("File not found");
  }
});

module.exports = router;
