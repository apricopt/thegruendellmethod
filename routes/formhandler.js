const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const Member = require("../models/Member")



router.post("/contactsubmit", (req, res) => {
  console.log(req.body);

  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.contact,
    subject: req.body.subject,
    message: req.body.message,
    bussinessName: req.body.business,
    instagram : req.body.instagram,
    youtube: req.body.youtube
  });
  contact
    .save()
    .then((result) => res.render("contact" , {
        contacted: true, 
        layout: "main"
    }))
    .catch((err) => console.log(err));
});


router.post("/loginsubmit" , async (req, res) => {
  const member = await Member.findOne({email: req.body.email}) ;
  if(member ==null){
    req.flash("message" , "Email does not exit")
  return  res.redirect(req.header('referrer'))
  }
  if(member.password !== req.body.password ){
    req.flash("message" , "Password is incorrect")
  return  res.redirect(req.header('referrer'))
  }
    if(!member.paid) {
    req.flash("message" , "You have not paid! You can't access this course")
  return  res.redirect(req.header('referrer'))
    }
  let courseNumber = parseInt(req.body.courseNumber)
  if(!member.courses.includes(courseNumber)){
    req.flash("message" , "You cannot access this course. You can only access the purchased courses")
  return  res.redirect(req.header('referrer'))
  }
      req.session.membered = true;
res.redirect(`/courseaccess/${courseNumber}/1`)
  
})



module.exports = router;
