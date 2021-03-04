const express = require('express');
const Member = require('../models/Member')
const router = express.Router();
const Paypal = require('paypal-recurring-se')
let theServer;

if (process.env.NODE_ENV === "development") {
  theServer = "http://localhost:5000";
} else {
  theServer = "http://159.89.85.107:5000";
}


const paypal = new Paypal({
    username: "sb-k47tfc3399949_api1.business.example.com" , 
    password: "VEFXWQ4LT78SDGMK", 
    signature: "AnrF8HqFyZC1ermEyxEMqUOGjGedAMkCoLHDK2MijJLs4upDOQ6jQZ.g",
});





// router.get("/recurring" , (req, res) => {
// res.send("recurring route is working")
// })



router.get('/recurring' , (req ,res) => {
  paypal.authenticate({
      RETURNURL: `http://localhost:5000/paypal/success`,
      CANCELURL: `http://localhost:5000/paypal/failed`,
// RETURNURL: `${theServer}/paypal/success`,
// CANCELURL: `${theServer}/paypal/failed`,
      PAYMENTREQUEST_0_AMT:           10,
  L_BILLINGAGREEMENTDESCRIPTION0: "Subscribing to the gruendell method course"
  }, function (err, data, url) {
      //redirect the user if everything went well with
      console.log("this is the data" , data)
      console.log("this is the url" , url)
    const dataToPush = {
      //   fill all the other entries
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      subscribedMonth: 1,
      courses: req.body.course,
      price: req.body.price,
      //   do not remove the paid
      paid: false,
    };

const member = new Member(dataToPush);
      member.save().then(result => {
          console.log("member initial data has been saved into db" , result);
          
      }).catch(err => {
          console.log("error agya intial save in db" , er )
      })

      if(!err) {
          res.redirect(302 , url);
      }

  })


router.get('/success' , (req ,res)=> {
    console.log("this is the request came from the payapal" , req.query)
  const PayerID = req.query.PayerID;
  const token = req.query.token;
    console.log("han g update hw")
  let amount;
    // Create a subscription of 10 USD every month
paypal.createSubscription(token,PayerID, {
  AMT:              10,
  DESC:             "Grendell method course membership area access",
  BILLINGPERIOD:    "Month",
  BILLINGFREQUENCY: 1,
}, function(err, data) {
  if (!err) {
    res.send("You are now one of our customers!");
    console.log("New customer with PROFILEID: " + data.PROFILEID)
  }
});

    })

// if the payment is failed then
router.get("/failed", (req, res) => {
  // @step 9 : also here
  req.flash("message", "Error Occured while making transaction");
  res.redirect(req.header("referrer"));
});


})


module.exports =  router
