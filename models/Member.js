const mongoose = require("mongoose");
const MemberSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: { type: String },
    password: { type: String },
    dateOfSubscription: { type: Date, default: Date.now },
    subscribedMonth: { type: Number, default: 1 },
    courses: [],
    paid: { type: Boolean, default: false },
    price: {
        type: Number
    },
    planId: {
        type: String
    },
    AgreementId: {
        type: String   
    },
    token: {
        type: String
    },
    profileId: {
        type: String,
        default: "not set"
    }
});
module.exports = mongoose.model("Member", MemberSchema);
