const express = require("express");
const router = express.Router();

function addheaders(req, res, next) {
  // res.header("Access-Control-Allow-Origin", "*");
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Origin, X-Requested-With, Content-Type, Accept"
  // );

  // res.header("Access-Control-Expose-Headers", "X-Total-Count, Content-Range");

  next();
}

router.get("/post", addheaders, (req, res) => {
  console.log("request recieved");
  res.header("Content-Range",  "posts 0-24/319");
  res.header("Access-Control-Expose-Headers", "Content-Range");
  res.json(
     [
      { id: 126, title: "allo?" },
      { id: 127, title: "bien le bonjour" },
      { id: 124, title: "good day sunshine" },
      { id: 123, title: "hello, world" },
      { id: 125, title: "howdy partner" },
    ],
  );
});

module.exports = router;
