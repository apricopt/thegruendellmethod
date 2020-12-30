const mongoose = require('mongoose');
const ContactSchema = new mongoose.Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type:String,
      
    },
    phone: {
        type:String,
      
    },
    subject: {
        type:String
  
    },
    message: {
        type:String
  
    },
    businessName: {
        type:String
  
    },
    instagram: {
        type:String
  
    },
    youtube: {
        type:String
  
    },
   
    createdAt: {
        type:Date, 
        defualt: Date.now
    }
})

module.exports = mongoose.model('Contact' ,  ContactSchema)