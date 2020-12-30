const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

// Loading the config
dotenv.config({ path: "./config/config.env" });
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
// morgan for logging
const morgan = require("morgan");
// bringing in the template engine handlebars
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const flash = require("connect-flash");

const session = require("express-session");

// importing routes here
const index = require("./routes/index");
// const pupeteer = require("./routes/pupeteer");
const courseaccess = require("./routes/courseaccess");
const formhandler = require("./routes/formhandler");
const admin = require("./routes/admin");
const calender = require("./routes/calender");
const upload = require("./routes/fileupload");
const paypal = require("./routes/paypal");

const app = express();
connectDB();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// handlebars
app.engine(".hbs", exphbs({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

// static folder
app.use(express.static(path.join(__dirname, "public")));

// middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());
app.use(
  session({
    cookie: { maxAge: 60000 },
    secret: "wort",
    resave: false,
    saveUninitialized: false,
  })
);

// using routes with router
app.use("/", index);
// the below route was for instagram
// app.use("/", pupeteer);
// the following file for access after payment
app.use("/", courseaccess);
// for handling the formsubmission etc
app.use("/", formhandler);
// admin panel
app.use("/", admin);
// calender here
app.use("/calender", calender);
// to handling uploads
app.use("/upload", upload);
// payment route
app.use("/paypal", paypal);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(
    `Server just started on port ${PORT} and running in ${process.env.NODE_ENV} mode `
  );
});
