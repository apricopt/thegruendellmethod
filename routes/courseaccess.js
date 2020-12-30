const express = require("express");

const router = express.Router();

router.get("/courseaccess", (req, res) => {
  res.render("courseaccess");
});

module.exports = router;
