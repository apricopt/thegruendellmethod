const express = require("express");
const router = express.Router();
const User = require("../models/User");
const flash = require("connect-flash");
const userInstagram = require("user-instagram")

const courses = require("../config/courses");
router.get("/",async (req, res) => {
    try{
    const result = await userInstagram('http://instagram.com/thegruendellmethod')
      let  threePosts = result.posts.map(item =>  
           item.url
        ) 
                res.render("index" , {
                feed1 : threePosts[0],
                feed2 : threePosts[1],
                    feed3: threePosts[2]
            
            })
    }    catch(error) {
        console.log(error)
                res.render("index" , {
                feed1 : "http://www.instagram.com/p/CKPQ0_JgTK4/",
                feed2 : threePosts[1],
                    feed3: threePosts[2]
    })
}});

router.get("/calender", (req, res) => {
  res.redirect("/calenderdynamic");
});

router.get("/contact", (req, res) => {
  res.render("contact");
});

router.get("/bulletproof", (req, res) => {
  res.render("course", {
    courseName: "Bullet Proof Immunity",
    courseNumber: 1,
    header: "/assets/img/zohaib/bulletproof.jpg",
    content:
      "Professionally guided course teaching you how to quickly and effectively boost your immune system. This course will help anyone achieve internal immunity boost through natural, proactive methods – such as slight altering of diet, taking detox hot baths, and jumpstarting the lymph system. Once strengthened, the human immune system can fight off anything that comes its way.",
    price: 27,
  });
});

router.get("/cleanas", (req, res) => {
  res.render("course", {
    courseName: "CleanAsAWhistle Detox",
    header: "/assets/img/zohaib/cleanas.jpg",
    courseNumber: 2,
    content:
      "Professionally curated course on detoxifying the body, which subsequently improves mental, physical, spiritual, and emotional well-being. Try our Clean as a Whistle to take advantage of the many benefits of increased … release oxygen in the digestive tract for the purpose of cleansing and Cleansing. To support the natural detoxification. Clean as a whistle inside",
    price: 34,
  });
});

router.get("/sugar", (req, res) => {
  res.render("course", {
    courseName: "Kickin's Sugar",
    courseNumber: 3,
    header: "/assets/img/zohaib/sugar.jpg",
    content:
      "This professionally guided micro-seminar helps clients decipher between the many different types of sugar present in today’s market. This course offers an in-depth look at: good sugars vs bad ones; reading food industry labels; various names for sugar on labels; which sugars are natural or unnatural; which sugars to pick for optimal health and good taste; and many more topics.",
    price: 34,
  });
});

router.get("/shop", (req, res) => {
  res.render("shop");
});

router.get("/subscribe/:courseNumber", (req, res) => {
  let courseNumber = parseInt(req.params.courseNumber);
  let courseName;
  let price;
  switch (courseNumber) {
    case 1:
      price = 27;
      courseName = "Bullet Proof Immunity";
      break;
    case 2:
      price = 200;
      courseName = "cleanAsAWhistle Detox";
      break;
    case 3:
      price = 300;
      courseName = "kickin's Sugar";
      break;
  }
  res.render("subscribe", {
    courseName: courseName,
    courseNumber: courseNumber,
    price: price,
  });
});

router.get("/courseaccess/:courseNumber/:videoNumber", (req, res) => {
  const courseNumber = parseInt(req.params.courseNumber);
  const videoNumber = req.params.videoNumber;
  const course = courses[courseNumber - 1];
  const courseName = course.title;
  const playlist = course.playlist.map((video, index) => {
    return {
        courseTitle: courseName,
      title: video.title,
      url: video.url,
      content: video.content,
      videoNumber: index + 1,
      number : video.number,
      courseNumber: courseNumber
    };
  });

  const currentVid = course.playlist[videoNumber-1];

  const numberOfVideos = playlist.length;
  res.render("courseaccess", {
    playlist: playlist,
    courseName: courseName,
    courseNumber: courseNumber,
    numberOfVideos: numberOfVideos,
    title :currentVid.title,
    url : currentVid.url,
    content: currentVid.content
  });
});

router.get("/learn" , (req, res) => {
  res.render("learn")
})
router.get("/login", (req, res) => {
  res.render("login", {
    message: req.flash("message"),
  });
});

router.post("/registerhandler", (req, res) => {
  console.log(req.body);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.phone,
  });
  user
    .save()
    .then((result) => res.render("index"))
    .catch((err) => console.log(err));
});


router.get("/connect" , (req, res) => {
  res.render("connect")
})

module.exports = router;
