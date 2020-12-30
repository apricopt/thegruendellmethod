
const path = require('path');

const express = require('express')
const router = express.Router();









const multer = require('multer')

// Set Storage engine
const storage = multer.diskStorage({
    destination: "./public/uploads",
    filename: function(req, file, cb) {
        cb(null ,file.fieldname + '-' + Date.now() +path.extname(file.originalname))
    }
});

// initialize upload
const upload = multer({
    storage: storage
}).single('image')
 

router.post("/image" , (req , res ) => {
    console.log(req.body);
    upload(req ,res , (err) => {
        if(err){
            console.log(err)
        }else{
            console.log(req.file);
            res.send("tested")
        }
    })
    });




module.exports = router;