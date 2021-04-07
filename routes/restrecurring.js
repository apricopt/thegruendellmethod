const express = require("express");
const paypal = require("paypal-rest-sdk");
const Member = require("../models/Member");
const url = require("url")
const router = express.Router();
let theServer = "https://thegruendellmethod.com";
const dora = process.env.NODE_ENV;
if (process.env.NODE_ENV === "development") {
  theServer = "http://localhost:5000";
} else {
  theServer = "http://159.89.85.107:5000";
}

//@step1 : Check whether you are working on testing env or live env

// for testing
// paypal.configure({
// mode: "sandbox", //sandbox or live
// client_id:
// "ARMxqU6CNz_slWFJdYrr8mzQTxpVAEmDvfxNzPPFjOlgFf1ryZVeTJGQ599NrPGkCr15CRrmed3gCdBg",
// client_secret:
// "EK6WzJV2U73nKiqFRQG5EyaXH1phMEbVX056HTwn2o8pzO_H3BnqaToY4Q5koREyvyrKqZn8eXxogdHO",
// });

// for live mode
paypal.configure({
mode: "live", //sandbox or live
client_id:
"ATl7xXG5ctLoIbwxRmfXZDp4a_lFxxZp6Gk1pcjVab9hPvLUBxpZVA5FTuMesJFoAWcj9c33mbq4c8ha",
client_secret:
"EBZBcm2q0V9vL9raDHUidD12Kii8H-49v-ahdTokS2XFhzvIsq4Cogx5gP2Y35_VIjHNxC6zBSFtP8-t",
});


var isoDate = new Date();
isoDate.setMonth(isoDate.getMonth()+1)
isoDate.setSeconds(isoDate.getSeconds() + 4);
isoDate.toISOString().slice(0, 19) + 'Z';

router.get("/", (req, res) => {
  res.send("paypal route is working");
});

// to create the payment and redirect the user to pay the amount
router.post("/recurring", (req, res) => {
  // @step2 : fill the below object this will be the data sent to the database with paid status as false because after successfull payment we will change it to true
  if (req.body.password !== req.body.confirmpassword) {
    req.flash(
      "message",
      "Please m ake sure you enter your password carefully!"
    );
    return res.redirect(req.header("referrer"));
  }
  // first checking if this person a/lready purchased the course or not
    try{
  (async () => {
    const member = await Member.find({ email: req.body.email });
    let alreadyCourses = [];
    let alreadyMember = false;
    let alreadyMemberId;
      if(false){
// if (member.length !== 0) {
      if (member[0].courses.includes(parseInt(req.body.courseNumber))) {
        req.flash("message", "You are already subscribed to this course");
        return res.redirect(req.header("referrer"));
      }
      alreadyMember = true;
      alreadyCourses = member[0].courses;
    }
    alreadyCourses.push(parseInt(req.body.courseNumber));

    const dataToPush = {
      //   fill all the other entries
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      courses: alreadyCourses,
      price: req.body.price,
      //   do not remove the paid
      paid: false,
    };
      var billingPlanAttributes = {
    "description": "Create Plan for Regular",
    "merchant_preferences": {
        "auto_bill_amount": "yes",
        "cancel_url": `${theServer}/paypal/failed`,
        "initial_fail_amount_action": "continue",
        "max_fail_attempts": "1",
        "return_url": `${theServer}/paypal/success`,
        "setup_fee": {
            "currency": "USD",
            "value":`${req.body.price}` 
        }
        
    },
    "name": "Buying Gruendell method's member subscription",
    "payment_definitions": [
        {
            "amount": {
                "currency": "USD",
                "value":`${req.body.price}` 
            },
            "cycles": "0",
            "frequency": "MONTH",
            "frequency_interval": "1",
            "name": "Bullet Proof Immunity",
            "type": "REGULAR"
        },
    ],
    "type": "INFINITE"
};

    // billingPlanAttributes  ends
//
//billing plan update attribute starts

var billingPlanUpdateAttributes = [
    {
        "op": "replace",
        "path": "/",
        "value": {
            "state": "ACTIVE"
        }
    }
];


//billing paln update attribute ends
//
// billing agreement object starting
console.log("this is iso date" , isoDate)
var billingAgreementAttributes = {
    "name": "Fast Speed Agreement",
    "description": "Agreement for Fast Speed Plan",
    "start_date": isoDate,
    "plan": {
        "id": "not set yet"
    },
    "payer": {
        "payment_method": "paypal"
    },
};
//billing agreement object ends

// i brought the code down now it time to rock 
//
// Create the billing plan
paypal.billingPlan.create(billingPlanAttributes, function (error, billingPlan) {
    if (error) {
        console.log(error);
        throw error;
    } else {
        console.log("Create Billing Plan Response");
        console.log(billingPlan);
        dataToPush.planId = billingPlan.id;

        // Activate the plan by changing status to Active
        paypal.billingPlan.update(billingPlan.id, billingPlanUpdateAttributes, function (error, response) {
            if (error) {
                console.log(error);
                throw error;
            } else {
                console.log("Billing Plan state changed to " + billingPlan.state);
                billingAgreementAttributes.plan.id = billingPlan.id;

                // Use activated billing plan to create agreement
                paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
                    if (error) {
                        console.log(error);
                        throw error;
                    } else {
                        console.log("Create Billing Agreement Response");
                        //console.log(billingAgreement);
                        for (var index = 0; index < billingAgreement.links.length; index++) {
                            if (billingAgreement.links[index].rel === 'approval_url') {
                                var approval_url = billingAgreement.links[index].href;
                                console.log("For approving subscription via Paypal, first redirect user to");
                                console.log(approval_url);
                                res.redirect(approval_url);

                                console.log("Payment token is");
                                console.log(url.parse(approval_url, true).query.token);
                                dataToPush.token = url.parse(approval_url , true).query.token;
                                
        const member = new Member(dataToPush)
            member.save().then(result => {
            console.log("db mai saved member is this " , result)
        }).catch((err) => {
            console.log(err)
        });
                                // See billing_agreements/execute.js to see example for executing agreement 
                                // after you have payment token
                            }
                        }
                    }
                });
            }
        });
    }
});
// all the stuff ends i think


    // below ends the async function of memberfinding
  })();

}// try ends
catch(err)

 {
     console.log(err)
        req.flash("message", "Error Occured");
        return res.redirect(req.header("referrer"));
 }




});

// if the payment was successfull then to execute the payment

router.get("/success", (req, res) => {
    console.log("the nadaaan parinda has returned" , req.query)
//Retrieve payment token appended as a parameter to the redirect_url specified in
//billing plan was created. It could also be saved in the user session
    
    Member.findOne({token: req.query.token}).then(
        member => 
        {
 let paymentToken = req.query.token;
 paypal.billingAgreement.execute(paymentToken, {}, function (error, billingAgreement) {
 if (error) {
 console.log(error);
 throw error;
 } else {
     member.paid = true;
     member.AgreementId = billingAgreement.id;
     member.save().then(updatedMember => console.log("this is updated member " , updatedMember)).catch(err => console.log("error occured while updating the member " , err ))
 console.log("Billing Agreement Execute Response");
 console.log(JSON.stringify(billingAgreement));
                req.flash("message", "You have been subscribed successfully!");
                res.redirect(`${theServer}/login`);

 }
 });
        }
    ).catch(err => {
        console.log("Member with token not found" , err )
    })


});








// if the payment is failed then
router.get("/failed", (req, res) => {
  // @step 9 : also here
  req.flash("message", "Error Occured while making transaction");
  res.redirect(req.header("referrer"));
});




router.post("/subscription" , (req , res ) => {


    (async () => {
 try{
        var cancel_note = {
    "note": "Canceling the agreement"
};
        const member = await Member.findOne({email: req.body.email}); if(member.length ==0) {
            req.flash("message" , "email do not exist")
            return res.redirect(req.header("referrer"))
        }
if(req.body.password !== member.password) {

            req.flash("message" , "You've Entered wrong password")
            return res.redirect(req.header("referrer"))

}
            let billingAgreementId = member.AgreementId;
            paypal.billingAgreement.cancel(billingAgreementId, cancel_note, function (err, response) {
  if (!err) {
      Member.deleteOne({email:req.body.email}).then(()=> {
      req.flash("message" , "You have been unsubscribed successfully")
          console.log("calcelation response " , response)
return res.redirect(req.header("referrer"))

      }).catch(err => console.log(err))
  }
});

 }
 catch(err){
 req.flash("message" , "Error occured while unsubscribing")
 console.log(err)
 return res.redirect(req.header("referrer"))
 }

    })()


})

module.exports = router;
