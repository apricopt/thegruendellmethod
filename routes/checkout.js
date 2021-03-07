const express = require('express');
const router = express.Router()

const paypal = require("paypal-rest-sdk");
const Order = require('../models/Order')

let theServer = "https://thegruendellmethod.com";
const dora = process.env.NODE_ENV;

// if (process.env.NODE_ENV === "development") {
// theServer = "http://localhost:5000";
// } else {
// theServer = "http://159.89.85.107:5000";
// }


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

router.get("/checkout" , (req, res)=> {
    res.render('checkout' , {
        message: req.flash("message")
    })
})



router.post("/checkout" , (req , res) => {
  // @step2 : fill the below object this will be the data sent to the database with paid status as false because after successfull payment we will change it to true

    console.log("this body is recieved" , req.body)
    let price;
    if(req.body.price.length == 0  ) {
        price= 15
    }
    const dataToPush = {
      //   fill all the other entries
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      qty : req.body.qty,
      price: price,
      address: req.body.address,
      //   do not remove the paid
      paid: false,
    };
    // creating a json object
    var create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${theServer}/checkout/success`,
        cancel_url: `${theServer}/checkout/failed`,
      },
      // @step3 : fill the below object this will be sent to paypal and also make sure to use parseInt() method in all prices and quantity to stay protected from type error.
      transactions: [
        {
          item_list: {
            items: [
              {
                name: req.body.name,
                sku: req.body.email,
                price: parseInt(price),
                currency: "USD",
                quantity: 1,
              },
            ],
          },
          amount: {
            currency: "USD",
            total: parseInt(price),
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
        // sending order to our database (Mongo)
        // @step 4 : sending the data to database in step 2 filled data will be pushed here just make sure to select the right model and just go through it
          const order = new Order(dataToPush);
          order
            .save()
            .then((result) => {
              console.log(order);
            })
            .catch((err) => console.log(err));

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
})


router.get("/checkout/success", (req, res) => {
  console.log(req.query);
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  const token = req.query.token;
  let amount;

  // first finding the price to  deduct
  //   @step 5 : just see if the models is right or not i mean make sure to have it same as it was in step 4
  Order.findOne({ paymentId: paymentId }).then((result) => {
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
              
            Order.findOneAndUpdate(
              { paymentId: paymentId },
              { $set: { paid: true } }
            )
              .then((result) => {
                console.log("yeh aya g result status ka ", result);
                // @step7 see if the success and failed urls are fine or not
                req.flash("message", "Your purchase was successfull!");
                res.redirect(`${theServer}/checkout`);
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
router.get("/checkout/failed", (req, res) => {
  // @step 9 : also here
  req.flash("message", "Error Occured while making transaction");
  res.redirect(req.header("referrer"));
});


module.exports = router;
