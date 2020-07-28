const express = require('express');
// controllers
const {chatRoomController} = require('../controllers/chatRoom.js');

const router = express.Router();

router
  .get('/', chatRoomController.getUserRooms) // user id is fetched from middleware
  .get('/:roomId', chatRoomController.getConversationByRoomId)
  .post('/initiate', chatRoomController.initiate)
  .put('/:roomId', chatRoomController.updateRoom)
  .post('/:roomId/message', chatRoomController.postMessage)
  .put('/:roomId/mark-read', chatRoomController.markConversationReadByRoomId)

exports.router = router;