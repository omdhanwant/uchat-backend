class WebSockets {
    users = [];
    constructor() {
      this.users = [];
    }
    connection(client) {
      this.users = [];
      // event fired when the chat room is disconnected
      client.on("disconnect", () => {
        if(this.users)
          this.users = this.users.filter((user) => user.socketId !== client.id);
      });
      // add identity of user mapped to the socket id
      client.on("identity", (user) => {
        this.users.push({
          socketId: client.id,
          userId: user.userId,
        });
        client.broadcast.emit('active', { user: user.name } );
      });
      // subscribe person to chat & other user as well
      client.on("subscribe", ([room,user, otherUserId = ""]) => {

        // this.subscribeOtherUser(room, otherUserId);
        // const userSockets = this.users.filter(
        //   (user) => user.userId === otherUserId
        // );
        // userSockets.map((userInfo) => {
        //   const socketConn = global.io.sockets.connected(userInfo.socketId);
        //   if (socketConn) {
        //     socketConn.join(room);
        //   }
        // });
        client.join(room);
        client.to(room).broadcast.emit('joined', { user: user.name } );
      });
      // mute a chat room
      client.on("unsubscribe", ([room, user]) => {
        client.to(room).broadcast.emit('left', { user: user.name } );
        client.leave(room);
      });
    }
  
    subscribeOtherUser(room, otherUserId) {
      const userSockets = this.users.filter(
        (user) => user.userId === otherUserId
      );
      userSockets.map((userInfo) => {
        const socketConn = global.io.sockets.connected(userInfo.socketId);
        if (socketConn) {
          socketConn.join(room);
        }
      });
    }
  }
  
  module.exports =  new WebSockets();