const express = require("express");

const Member = require("../models/Member");
const router = express.Router();

router.get("/", async (req, res) => {
  const id = "xadxeb@gmail.com";
  let courses = [1, 2, 3, 5, 0];
  const found = await Member.findOne({ email: id });
  console.log("data found", found);
  found.courses = courses;
  const result = await found.save();
  console.log(result);
});

router.get("/member", (req, res) => {
  Member.findByIdAndUpdate("");
});

module.exports = router;
