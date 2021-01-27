const express = require('express');
// controllers
const {chatRoomController} = require('../controllers/chatRoom.js');

const router = express.Router();
const { decode } = require('../middlewares/jwt');

router
  .get('/',decode, chatRoomController.getUserRooms) // user id is fetched from middleware
  .get('/:roomId',decode, chatRoomController.getChatRoomById) // user id is fetched from middleware
  .get('/:roomId/conversations',decode, chatRoomController.getConversationByRoomId)
  .post('/initiate',decode, chatRoomController.initiate)
  .put('/:roomId',decode, chatRoomController.updateRoom)
  .post('/:roomId/message',decode, chatRoomController.postMessage)
  .put('/:roomId/mark-read',decode, chatRoomController.markConversationReadByRoomId)

exports.router = router;