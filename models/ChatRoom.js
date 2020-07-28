const mongoose = require('mongoose');
const { v4 } = require('uuid');

const CHAT_ROOM_TYPES = {
  CONSUMER_TO_CONSUMER: "consumer-to-consumer",
  CONSUMER_TO_SUPPORT: "consumer-to-support",
};

const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => v4().replace(/\-/g, ""),
    },
    name: String,
    image: String,
    userIds: Array,
    type: String,
    chatInitiator: String,
  },
  {
    timestamps: true,
    collection: "chatrooms",
  }
);

chatRoomSchema.statics.initiateChat = async function (
	name, image , userIds, type, chatInitiator
) {
  try {
    const availableRoom = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds],
      },
      type,
    });
    if (availableRoom) {
      return {
        isNew: false,
        message: 'retrieving an old chat room',
        chatRoomId: availableRoom._doc._id,
        type: availableRoom._doc.type,
      };
    }

    const newRoom = await this.create({ name, image,  userIds, type, chatInitiator });
    return {
      isNew: true,
      message: 'Created a new chatroom',
      chatRoomId: newRoom._doc._id,
      type: newRoom._doc.type,
    };
  } catch (error) {
    console.log('error on initiating chat room', error);
    throw error;
  }
}

chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
    try {
      const room = await this.findOne({ _id: roomId });
      return room;
    } catch (error) {
      throw error;
    }
  }


  chatRoomSchema.statics.getRoomsByUserId = async function (userId) {
    try {
      const rooms = await this.find();
      // filter rooms by userId
      const roomsByUserId = rooms.filter(room => room.userIds.includes(userId));
      return roomsByUserId;
    } catch (error) {
      throw error;
    }
  }

  chatRoomSchema.statics.updateChatRoom = async function (room) {
    try {
      const updatedRoom = await this.findOneAndUpdate(
        {_id: room._id},
        {$set:room},
        {new:true,
         useFindAndModify: false});
      
      return updatedRoom;
    } catch (error) {
      throw error;
    }
  }

exports.ChatRoomModel =  mongoose.model("ChatRoom", chatRoomSchema);
exports.CHAT_ROOM_TYPES = CHAT_ROOM_TYPES;