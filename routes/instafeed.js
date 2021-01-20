const express = require('express');
const router = express.Router();

const userInstagram = require("user-instagram");


router.get("/instafeed" , (req, res ) => {

// Gets informations about a user
userInstagram('thegruendellmethod') // Same as getUserData()
  .then(console.log)
  .catch(console.error);

// Gets information about a post
// userInstagram.getPostData('CD9EMe5sHP5')
// .then(console.log)
// .catch(console.error)

})  

module.exports = router;
