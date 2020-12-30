const express = require("express");
const router = express.Router();
const fns = require("date-fns");
const parseISO = require("date-fns/parseISO");
const Calender = require("../models/Calender");

const { upload } = require("../config/fileupload");

//  to get the data of the whole events and months
router.get("/dynamic", (req, res) => {
  (async () => {
    let monthhName;
    let daysInMonth;
    dateNow = Date.now();
    let monthToPut;
    let monthPosition;
    let defaultMonth = false;
    let monthName;
    if (req.query.previous) {
      monthToPut = fns.addMonths(dateNow, -1);
      monthhName = fns.format(monthToPut, "MMMM");
      daysInMonth = fns.getDaysInMonth(monthToPut);
      monthPosition = 0;
      monthName = fns.getMonth(monthToPut);
    } else if (req.query.forward) {
      monthToPut = fns.addMonths(dateNow, 1);
      monthhName = fns.format(monthToPut, "MMMM");
      daysInMonth = fns.getDaysInMonth(monthToPut);
      monthPosition = 1;
      monthName = fns.getMonth(monthToPut);
    } else {
      monthhName = fns.format(Date.now(), "MMMM");
      daysInMonth = fns.getDaysInMonth(Date.now());
      defaultMonth = true;
      monthName = fns.getMonth(Date.now());
    }
    console.log(req.query);
    console.log(monthhName, daysInMonth, monthToPut);

    // Getting the Events from the db
    const events = await Calender.find({ month: monthName }).lean();
    // console.log(events);

    const arrayOfDays = events.map((item) => item.day);

    // console.log(arrayOfDays);
    arrayOfEvents = [];
    for (let i = 1; i <= daysInMonth; i++) {
      arrayOfEvents.push({
        evented: false,
        day: i,
      });
    }

    const finalArrayOfEvents = arrayOfEvents.map((item) => {
      let found = false;
      for (let i = 0; i < events.length; i++) {
        if (events[i].day == item.day) {
          return events[i];
          found = true;
          break;
        }
      }
      if (!found) {
        return item;
      }
    });
    // console.log(finalArrayOfEvents);
    res.render("calender", {
      layout: "calenderLayout",
      monthName: monthhName,
      data: finalArrayOfEvents,
      monthPosition: monthPosition,
      defaultMonth: defaultMonth,
    });
  })();
});

// admin side
// Create Event

router.post("/createnew", (req, res) => {
  // console.log(req.body);
  // console.log(req.body);
  upload(req, res, (err) => {
    if (err) {
      // console.log(err);
      res.render("admin/calenderAdmin", {
        layout: "adminLayout",
        message: err,
      });
    } else {
      let img = req.file.path;
      let reachbalePath = img.replace("public", "");
      let formatedDate = parseISO(req.body.date);
      let monthName = fns.getMonth(formatedDate);
      let dayName = fns.getDate(formatedDate);

      const event = new Calender({
        Date: formatedDate,
        month: monthName,
        day: dayName,
        link: req.body.link,
        img: reachbalePath,
        title: req.body.title,
      });
      event
        .save()
        .then((result) => {
          // console.log(result);
          res.redirect("/admin/calender");
        })
        .catch((err) => console.log(err));
    }
  });
});

module.exports = router;
