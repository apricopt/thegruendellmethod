const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");
const { json } = require("body-parser");
const Calender = require("../models/Calender");
const fns = require("date-fns");

// admin panel routes

router.get("/admin", (req, res) => {
  res.render("admin/index", {
    layout: "adminLayout",
  });
});

router.get("/admin/contact", (req, res) => {
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

// all the science starts from here

// to del all contact
router.get("/admin/contact/delete", (req, res) => {
  Contact.deleteMany()
    .then((result) => {
      res.redirect("/admin/contact");
    })
    .catch((err) => console.log(err));
});

// to del one contact
router.post("/admin/contact/deleteone", (req, res) => {
  console.log(req.body);
  Contact.deleteOne({ _id: req.body.id })
    .then((result) => {
      res.send("deleted");
    })
    .catch((err) => console.log(err));
});

// to edit one contact
router.post("/admin/contact/editone", (req, res) => {
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

router.get("/admin/calender", (req, res) => {
  (async () => {
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
  })();
});

// to del one calender
router.post("/admin/calender/deleteone", (req, res) => {
  console.log(req.body);
  Calender.deleteOne({ _id: req.body.id })
    .then((result) => {
      res.send("deleted");
    })
    .catch((err) => console.log(err));
});

module.exports = router;
