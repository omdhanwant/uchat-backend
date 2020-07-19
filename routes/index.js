const express = require('express');

// middlewares
const  { encode }  = require("../middlewares/jwt.js");

const router = express.Router();

router.post('/login', encode, (req, res) => {
    return res
    .status(200)
    .json({
      success: true,
      authorization: req.authToken,
    });
})

exports.router = router;