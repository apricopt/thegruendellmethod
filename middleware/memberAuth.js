
const session = require('express-session');
module.exports = function(req, res , next) {
if(req.session.membered){
// if(true){
        console.log("Member was logged in")
        next();
    }else {
        console.log("Member tried to access course page without logging in")
        req.flash("message" , "Please login to have access")
        res.redirect("/login")
    }
}
