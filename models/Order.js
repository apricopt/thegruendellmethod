
const mongoose = require("mongoose");
const OrderSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: { type: String },
  contact: { type: String },
qty: {type: Number},
    address: {type: String},
    city : {type:String},
    state: {type:String},
    zip : {type:String},
  paid: { type: Boolean, default: false },
  price: {
    type:Number,

  },
  paymentId : { 
    type:String
  }
});
module.exports = mongoose.model("Order", OrderSchema);
