const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");
const { json } = require("body-parser");
const Calender = require("../models/Calender");
const Member = require("../models/Member");
const fns = require("date-fns");
const checkAuth = require("../middleware/auth");
const User = require("../models/User");

// admin panel route
router.get("/admin/login", (req, res) => {
  res.render("admin/login", {
    layout: "adminLayout",
    message: req.flash("message"),
  });
});

router.get("/admin", checkAuth, async (req, res) => {
  const contactEntries = await Contact.estimatedDocumentCount();
  const memberEntries = await Member.estimatedDocumentCount();
  const eventEntries = await Calender.estimatedDocumentCount();
  
  res.render("admin/index", {
    layout: "adminLayout",
    contactEntries: contactEntries,
    eventEntries: eventEntries,
    memberEntries: memberEntries,
  });
});

router.get("/admin/contact", checkAuth, (req, res) => {
  let data;
  (async () => {
    try {
      data = await Contact.find().lean();
      //  data = JSON.parse(data);
      console.log(data);
      res.render("admin/contactAdmin", {
        data: data,
        layout: "adminLayout",
      });
    } catch (error) {
      console.log(error);
    }
  })();
});
router.get("/admin/members", checkAuth, (req, res) => {
  let data;
  (async () => {
    try {
      data = await Member.find().lean();
      //  data = JSON.parse(data);
      const modifyieddata = data.map((item) => ({
        _id: item._id,
        name: item.name,
        email: item.email,
        dateOfSubscription: fns.format(item.dateOfSubscription, "dd/MMM/yyyy"),
        courses: item.courses,
      }));
      console.log(data);
      res.render("admin/memberAdmin", {
        data: modifyieddata,
        layout: "adminLayout",
      });
    } catch (error) {
      console.log(error);
    }
  })();
});

// all the science starts from here

// to del all contact
router.get("/admin/contact/delete", checkAuth, (req, res) => {
  Contact.deleteMany()
    .then((result) => {
      res.redirect("/admin/contact");
    })
    .catch((err) => console.log(err));
});

// to del one contact
router.post("/admin/contact/deleteone", checkAuth, (req, res) => {
  console.log(req.body);
  Contact.deleteOne({ _id: req.body.id })
    .then((result) => {
      res.send("deleted");
    })
    .catch((err) => console.log(err));
});

// to edit one contact
router.post("/admin/contact/editone", checkAuth, (req, res) => {
  console.log(req.body);
  (async () => {
    try {
      let response = await Contact.findOneAndUpdate(
        { _id: req.body.id },
        {
          name: req.body.name,
          email: req.body.email,
          phone: req.body.phone,
          message: req.body.message,
        }
      );
      res.redirect("/admin/contact");
    } catch (error) {
      console.log(error);
    }
  })();
});

// to delete one member
router.get("/admin/members/deleteone/:id", checkAuth, (req, res) => {
  const idToRemove = req.params.id;
  Member.deleteOne({ _id: idToRemove })
    .then((result) => {
      res.redirect("/admin/members");
    })
    .catch((err) => console.log(err));
});

router.get("/admin/calender", checkAuth, (req, res) => {
  async () => {
    try {
      const data = await Calender.find().lean();
      // g date ayi thi pares ho kar
      // let dateJoAyi = data[0].Date;
      // ab mai ausy format karunga
      // let dateJoBanayi = fns.format(dateJoAyi, "dd/MM/yyyy");
      // console.log(dateJoAyi);
      // console.log(dateJoBanayi);

      console.log("yeh raha data ", data);
      const alteredData = data.map((item) => {
        return {
          _id: item._id,
          Date: fns.format(item.Date, "dd/MMMM/yyyy"),
          link: item.link,
          img: item.img,
          title: item.title,
        };
      });

      console.log("yeh raha altered data ", alteredData);

      res.render("admin/calenderAdmin", {
        layout: "adminLayout",
        data: alteredData,
      });
    } catch (error) {
      console.log(error);
    }
  };
});

// to del one calender
router.post("/admin/calender/deleteone", checkAuth, (req, res) => {
  console.log(req.body);
  Calender.deleteOne({ _id: req.body.id })
    .then((result) => {
      res.send("deleted");
    })
    .catch((err) => console.log(err));
});

// admin login handler
router.post("/admin/loginauth", async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email }).lean();
    console.log(user);
    console.log(req.body);
    if (user.length == 0) {
      req.flash("message", "User doesnot exists");
      res.redirect("/admin/login");
    }
    if (user[0].password != req.body.password) {
      req.flash("message", "Incorrect Password");
      res.redirect("/admin/login");
    } else if (user[0].email != req.body.email) {
      req.flash("message", "Email doesnot exists");
      res.redirect("/admin/login");
    } else {
      req.session.loggedin = true;
      console.log(req.session.loggedin);
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error);
  }
});



router.get("/auth/logout", checkAuth, (req, res) => {
  req.session.loggedin = false;
  req.flash("message" , "Logged out!")
  res.redirect("/admin/login");
});
module.exports = router;
