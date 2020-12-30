const mongoose = require("mongoose");
const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: { type: String },
  password: { type: String },
  dateOfSubscription: { type: Date, default: Date.now },
  subscribedMonth: { type: Number, default: 1 },
  courses: [],
  paid: { type: Boolean, default: false },
  price: {
    type:Number,

  },
  paymentId : { 
    type:String
  }
});
module.exports = mongoose.model("Member", MemberSchema);
