const nodemailer = require('nodemailer')


let mailTransporter = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
        user: 'freebie.thegruendellmethod@gmail.com', 
        pass: 'abcd1214'
    } 
}); 


 function sendMail(email) {

let mailDetails = { 
    from: 'freebie.thegruendellmethod@gmail.com', 
    to:`${email}`,  
    subject: 'Freebie Catch - The Gruendell Method', 
    text: 'Thanks for subscribing! Here is your freebie https://thegruendellmethod.com/getmefreebie'
}; 
  
mailTransporter.sendMail(mailDetails, function(err, data) { 
    if(err) { 
        console.log('Error Occurs'); 
    } else { 
        console.log('Email sent successfully'); 
    } 
}); 

}




module.exports = sendMail
