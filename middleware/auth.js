const session = require('express-session');
module.exports = function(req, res , next) {
if(req.session.loggedin){
// if(true){
        console.log("user was logged in access granted")
        next();
    }else {
        console.log("access denied")
        req.flash("message" , "Please login to have access")
        res.redirect("/admin/login")
    }
}
