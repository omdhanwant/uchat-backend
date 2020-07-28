const express = require('express');
const multer = require('multer');
const fs = require('fs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'tmp/images');
    },
    filename: (req, file, cb ) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage})


// middlewares
const  { encode }  = require("../middlewares/jwt.js");

const router = express.Router();

router.post('/login', encode, (req, res) => {
    return res
    .status(200)
    .json({
      success: true,
      authorization: req.authToken,
      user: req.user
    });
})

router.post('/upload-image', upload.single('image') , (req, res) => {
  try {
    const img = fs.readFileSync(req.file.path);
    // let encode_image = img.toString('base64');
    // var uri = 'data:' + 'image/*' + ';' + 'base64' + ',' + encode_image; 
    const imageObj = {
      image: img
    }
    res.send(imageObj);
  } 
  catch(err){
    return res.status(500).json({ success: false, message: err })
  }
})

exports.router = router;