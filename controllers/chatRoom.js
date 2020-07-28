const makeValidation = require("@withvoid/make-validation");
const { ChatRoomModel, CHAT_ROOM_TYPES } = require('../models/ChatRoom');
const { ChatMessageModel } = require('../models/ChatMessage');
const { UserModel } = require('../models/User');

exports.chatRoomController  ={

    // POST ('/initiate')
    // initiate the chat
    initiate: async (req, res) => { 
        try {
            const validation = makeValidation(types => ({
              payload: req.body,
              checks: {
                userIds: { 
                  type: types.array, 
                  options: { unique: true, empty: false, stringOnly: true } 
                },
                type: { type: types.enum, options: { enum: CHAT_ROOM_TYPES } },
                name: { type: types.string, options: {empty: true}},
                image: { type: types.string, options: {empty: true}}
              }
            }));
            if (!validation.success) return res.status(400).json({ ...validation });

               // image validation
              // if(image && typeof(image) !== Buffer) {
              //   if (!validation.success) return res.status(400).json({ imageError: 'Image type is not allowed' });
              // }            
        
            const { name, image,userIds, type } = req.body;
            const { userId: chatInitiator } = req;
            const allUserIds = [...userIds, chatInitiator];
            const chatRoom = await ChatRoomModel.initiateChat(name, image, allUserIds, type, chatInitiator);
            return res.status(200).json({ success: true, chatRoom });
          } catch (error) {
            return res.status(500).json({ success: false, message: error })
          }
     },

     updateRoom: async (req, res) => {
      try{
        const validation = makeValidation(types => ({
          payload: req.body,
          checks: {
            userIds: { 
              type: types.array, 
              options: { unique: true, empty: false, stringOnly: true } 
            },
            type: { type: types.enum, options: { enum: CHAT_ROOM_TYPES } },
            name: { type: types.string, options: {empty: true}},
            image: { type: types.string, options: {empty: true}}
          }
        }));
        if (!validation.success) return res.status(400).json({ ...validation });

        // image validation
        // if(image && typeof(image) !== Buffer) {
        //   if (!validation.success) return res.status(400).json({ imageError: 'Image type is not allowed' });
        // }

        const { roomId } = req.params;

        let room = await ChatRoomModel.getChatRoomByRoomId(roomId);
        room.name = req.body.name
        room.type = req.body.type
        room.image = req.body.image
        const updatedRoom = await ChatRoomModel.updateChatRoom(room);
        return res.status(200).json({ success: true, room: updatedRoom });
        
      } 
      catch (error) {
            return res.status(500).json({ success: false, error: error })
        }
     },

     // POST (/:roomId/message)
     // send message
    postMessage: async (req, res) => { 
        try {
            const { roomId } = req.params;
            const validation = makeValidation(types => ({
              payload: req.body,
              checks: {
                messageText: { type: types.string },
              }
            }));
            if (!validation.success) return res.status(400).json({ ...validation });
        
            const messagePayload = {
              messageText: req.body.messageText,
            };
            const currentLoggedUser = req.userId;
            const post = await ChatMessageModel.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
            global.io.sockets.in(roomId).emit('new message', { message: post });
            return res.status(200).json({ success: true, post });
          } 
          catch (error) {
            return res.status(500).json({ success: false, error: error })
          }
    },

     // GET ('/')
    // get recent rooms of user
    getUserRooms: async (req, res) => {
      try {
        const userId = req.userId;
        const rooms = await ChatRoomModel.getRoomsByUserId(userId);
        return res.status(200).json({ success: true,  rooms});
      } catch (error) {
        return res.status(500).json({ success: false, error: error })
      }
     },

    // GET ('/:roomId')
    // get messages in chat room
    getConversationByRoomId: async (req, res) => { 
        try {
            const { roomId } = req.params;
            const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
            if (!room) {
              return res.status(400).json({
                success: false,
                message: 'No room exists for this id',
              })
            }
            const users = await UserModel.getUserByIds(room.userIds);
            const options = {
              page: parseInt(req.query.page) || 0,
              limit: parseInt(req.query.limit) || 10,
            };
            const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
            return res.status(200).json({
              success: true,
              conversation,
              users,
            });
          } catch (error) {
            return res.status(500).json({ success: false, error });
          }
    },

    // POST ('/:roomId/mark-read')
    // mark message read by user
    markConversationReadByRoomId: async (req, res) => { 
        try {
            const { roomId } = req.params;
            const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
            if (!room) {
              return res.status(400).json({
                success: false,
                message: 'No room exists for this id',
              })
            }
        
            const currentLoggedUser = req.userId;
            const result = await ChatMessageModel.markMessageRead(roomId, currentLoggedUser);
            return res.status(200).json({ success: true, data: result });
          } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, error });
          }
    },
  }