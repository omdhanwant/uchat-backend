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
      client.on("identity", (userId) => {
        this.users.push({
          socketId: client.id,
          userId: userId,
        });
        console.log(this.users);
      });
      // subscribe person to chat & other user as well
      client.on("subscribe", (room, otherUserId = "") => {
        console.log("subscribe:");
        console.log(`Room: ${room}`);
        // this.subscribeOtherUser(room, otherUserId);
        const userSockets = this.users.filter(
          (user) => user.userId === otherUserId
        );
        userSockets.map((userInfo) => {
          const socketConn = global.io.sockets.connected(userInfo.socketId);
          if (socketConn) {
            socketConn.join(room);
          }
        });
        client.join(room);
      });
      // mute a chat room
      client.on("unsubscribe", (room) => {

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