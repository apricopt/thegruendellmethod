const express = require("express");
const Member = require("../models/Member");
const router = express.Router();
const Paypal = require("paypal-recurring-se");
let theServer;

// if (process.env.NODE_ENV === "development") {
if (true) {
  theServer = "http://localhost:5000";
} else {
  theServer = "http://159.89.85.107:5000";
}

 const paypal = new Paypal({
 username: "sb-k47tfc3399949_api1.business.example.com",
 password: "EK6WzJV2U73nKiqFRQG5EyaXH1phMEbVX056HTwn2o8pzO_H3BnqaToY4Q5koREyvyrKqZn8eXxogdHO",
 signature: "AnrF8HqFyZC1ermEyxEMqUOGjGedAMkCoLHDK2MijJLs4upDOQ6jQZ.g",
});

// router.get("/recurring" , (req, res) => {
// res.send("recurring route is working")
// })

router.post("/recurring", (req, res) => {
  console.log("yeh ayi body ", req.body);
  //if the password does not match
  if (req.body.password !== req.body.confirmpassword) {
    req.flash(
      "message",
      "Please make sure you enter your password carefully!"
    );
    return res.redirect(req.header("referrer"));
  }

  (async () => {
    const member = await Member.find({ email: req.body.email });
    let alreadyCourses = [];
    let alreadyMember = false;
    let alreadyMemberId;
    if (member.length !== 0) {
      if (member[0].courses.includes(parseInt(req.body.courseNumber))) {
        req.flash("message", "You are already subscribed to this course");
        return res.redirect(req.header("referrer"));
      }
      alreadyMember = true;
      alreadyCourses = member[0].courses;
    }
    alreadyCourses.push(parseInt(req.body.courseNumber));
    //above to async is copied
    let amount = parseInt(req.body.price);
    paypal.authenticate(
      {
// RETURNURL: `http://localhost:5000/paypal/success`,
// CANCELURL: `http://localhost:5000/paypal/failed`,
         RETURNURL: `${theServer}/paypal/success`,
         CANCELURL: `${theServer}/paypal/failed`,
        PAYMENTREQUEST_0_AMT: amount,
        L_BILLINGAGREEMENTDESCRIPTION0:
          "Subscribing to the gruendell method course",
      },
      function (err, data, url) {
        if (!err) {
          //redirect the user if everything went well with
          console.log("this is the data", data.TOKEN);

          console.log("this is the url", url);
          const dataToPush = {
            //   fill all the other entries
            token: data.TOKEN,
            name: req.body.name,
            price: parseInt(amount),
            email: req.body.email,
            password: req.body.password,
            subscribedMonth: 1,
            courses: alreadyCourses,
            paid: false,
          };
          console.log("yeh data push hoga db mai", dataToPush);

          const member = new Member(dataToPush);
          member
            .save()
            .then((result) => {
              console.log("member initial data has been saved into db", result);
            })
            .catch((err) => {
              console.log("error agya intial save in db", err);
            });

          res.redirect(302, url);
        } else {
          console.log(" err agya " ,err );
        }
      }
    );
    //async ends below
  })();
  // below ending the main route
});

router.get("/success", (req, res) => {
  console.log("this is the request came from the payapal", req.query);
  const PayerID = req.query.PayerID;
  const token = req.query.token;
  console.log("han g update hw");
  let amount;
  // Create a subscription of 10 USD every month
  (async () => {
    try {
      const member = await Member.findOne({ token: token });
      console.log("yeh rahaa member jo aya db se ", member);
      amount = parseInt(member.price);
      paypal.createSubscription(
        token,
        PayerID,
        {
          AMT: amount,
          DESC: "Subscribing to the gruendell method course",
          BILLINGPERIOD: "Month",
          BILLINGFREQUENCY: 1,
        },
        function (err, data) {
          if (!err) {
            Member.findOneAndUpdate(
              { token: token },
              {
                $set: {
                  paid: true,
                  profileId: data.PROFILEID,
                },
              }
            )
              .then((result) => {
                req.flash("message", "You have been subscribed successfully!");
                res.redirect(`${theServer}/login`);
              })
              .catch((err) => {
                console.log(err);
                res.send("Error occured while making your our member");
              });
          } else {
            console.log("yeh error aya lumbardar g ", err);
          }
        }
      );
    } catch (err) {
      console.log("error occured while getting the meber with the token");
      console.log(err);
    }
  })();
});

// if the payment is failed then
router.get("/failed", (req, res) => {
  // @step 9 : also here
  req.flash("message", "Error Occured while making transaction");
  res.redirect(req.header("referrer"));
});


router.post("/subscription" , (req , res) => {
    (async () => {
        try{
        console.log(req.body)
        const member = await Member.findOne({email: req.body.email});
        if(member.length ==0) {
            req.flash("message" , "email do not exist")
            return res.redirect(req.header("referrer"))
        }
    paypal.modifySubscription(member.profileId, 'Cancel' , function(err, data) {
  if (!err) {
      Member.deleteOne({email:req.body.email}).then(()=> {
      req.flash("message" , "You have been unSubsribed successfully")
return res.redirect(req.header("referrer"))

      }).catch(err => console.log(err))
  }
});

        }catch(err){
            req.flash("message" , "Error occured while unSubsribing")
            return res.redirect(req.header("referrer"))
            console.log(err)
        }

    })()


})

module.exports = router;
