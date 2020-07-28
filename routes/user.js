const express = require('express');
// controllers
const {user} = require("../controllers/user.js");

const router = express.Router();

router
  .get('/', user.onGetAllUsers)
  .post('/', user.onCreateUser)
  .put('/:id', user.onUpdateUser)
  .get('/:id', user.onGetUserById)
  .delete('/:id', user.onDeleteUserById)

exports.router = router;