const mongoose = require('mongoose');
const CalenderSchema = new mongoose.Schema({
    Date: {
        type:Date,
        required: true
    },
    month: {
        type:Number,
    },
    day : {
        type:Number
    },
    link: {
        type:String,
      
    },
    img: {
        type:String,
      
    },
    title: {
        type:String
  
    },
    createdAt: {
        type:Date, 
        defualt: Date.now
    }
})

module.exports = mongoose.model('Calender' , CalenderSchema)