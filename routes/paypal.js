const express = require("express");
const paypal = require("paypal-rest-sdk");
const Member = require("../models/Member");
const router = express.Router();
let theServer;
const dora = process.env.NODE_ENV;
if (process.env.NODE_ENV === "development") {
  theServer = "http://localhost:5000";
} else {
  theServer = "http://159.89.85.107:5000";
}

//@step1 : Check whether you are working on testing env or live env

// for testing
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ARMxqU6CNz_slWFJdYrr8mzQTxpVAEmDvfxNzPPFjOlgFf1ryZVeTJGQ599NrPGkCr15CRrmed3gCdBg",
  client_secret:
    "EK6WzJV2U73nKiqFRQG5EyaXH1phMEbVX056HTwn2o8pzO_H3BnqaToY4Q5koREyvyrKqZn8eXxogdHO",
});

// for live mode
// paypal.configure({
//   mode: "live", //sandbox or live
//   client_id:
//     "AZ2TWSbrGsjHHGINwWHWnosbbzdyfTHx52t9KLCZXJqStsoaIJZf6t2-NiuNyMLMXxjWoEW-4V_7ceLV",
//   client_secret:
//     "EL2Gi9koFe5ha63YFxai9oXp3H3Jylpc_RGnopEj5olEZ6gPNXFPRoixcY25LOXcVLRD4S9_C-THoMaL",
// });

router.get("/", (req, res) => {
  res.send("paypal route is working");
});

// to create the payment and redirect the user to pay the amount
router.post("/membership", (req, res) => {
  // @step2 : fill the below object this will be the data sent to the database with paid status as false because after successfull payment we will change it to true
  if (req.body.password !== req.body.confirmpassword) {
    req.flash(
      "message",
      "Please m ake sure you enter your password carefully!"
    );
    return res.redirect(req.header("referrer"));
  }
  // first checking if this person a/lready purchased the course or not
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

    const dataToPush = {
      //   fill all the other entries
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      subscribedMonth: 1,
      courses: alreadyCourses,
      price: req.body.price,
      //   do not remove the paid
      paid: false,
    };
    // the below object will be only used if the member is already
    const dataToUpdate = {
      courses: alreadyCourses,
      price: req.body.price,
    };
    // creating a json object
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${theServer}/paypal/success`,
        cancel_url: `${theServer}/paypal/failed`,
      },
      // @step3 : fill the below object this will be sent to paypal and also make sure to use parseInt() method in all prices and quantity to stay protected from type error.
      transactions: [
        {
          item_list: {
            items: [
              {
                name: req.body.name,
                sku: req.body.email,
                price: parseInt(req.body.price),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: parseInt(req.body.price),
          },
          description: "This is the payment description.",
        },
      ],
    };
    // json object ends

    // creating the payment
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error;
      } else {
        console.log("Payment has been created ", payment);

        //   before pushing the data to db also insert the paymentId that came after creating payment so we can later query that with paymentid
        dataToPush.paymentId = payment.id;
        dataToUpdate.paymentId = payment.id;
        // sending order to our database (Mongo)
        // @step 4 : sending the data to database in step 2 filled data will be pushed here just make sure to select the right model and just go through it
        if (!alreadyMember) {
          const order = new Member(dataToPush);
          order
            .save()
            .then((result) => {
              console.log(order);
            })
            .catch((err) => console.log(err));
        } else {
          (async () => {
            const member = await Member.findOne({ email: req.body.email });
            member.courses = alreadyCourses;
            member.paymentId = dataToUpdate.paymentId;
            member.price = dataToUpdate.price;
            await member.save();
          })();
        }

        // sending ends.
        // now we need to redirect the user to the approval link and to redirect we need to loop through the links
        for (i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === "approval_url") {
            //   send the link back or redirect depending on the situation just the thing is that user need to be redirected to the following link so he can pay
            res.redirect(payment.links[i].href);
          }
        }
      }
    });

    // below ends the async function of memberfinding
  })();
});

// if the payment was successfull then to execute the payment

router.get("/success", (req, res) => {
  console.log(req.query);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const token = req.query.token;
  let amount;

  // first finding the price to  deduct
  //   @step 5 : just see if the models is right or not i mean make sure to have it same as it was in step 4
  Member.findOne({ paymentId: paymentId }).then((result) => {
    const amount = result.price;
    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: parseInt(amount),
          },
        },
      ],
    };

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log("got payment response", payment);
          if (payment.state == "approved") {
            // now updating the status of paid to true.
            // @step6 : now update the status into db paid: true because payment was successfull
            Member.findOneAndUpdate(
              { paymentId: paymentId },
              { $set: { paid: true } }
            )
              .then((result) => {
                console.log("yeh aya g result status ka ", result);
                // @step7 see if the success and failed urls are fine or not
                req.flash("message", "You have been subscribed successfully!");
                res.redirect(`${theServer}/login`);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            //   @step8 : also here
            req.flash("message", "Error Occured while making transaction");
            res.redirect(req.header("referrer"));
          }
        }
      }
    );
  });
});

// if the payment is failed then
router.get("/failed", (req, res) => {
  // @step 9 : also here
  req.flash("message", "Error Occured while making transaction");
  res.redirect(req.header("referrer"));
});

module.exports = router;
