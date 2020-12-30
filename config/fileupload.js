const path = require("path");
const multer = require("multer");

// Set Storage engine
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

// initialize upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
}).single("image");
// the above image name is the name of the field comming from a form in which enctype must be the multipart/form-data

module.exports = { upload };
