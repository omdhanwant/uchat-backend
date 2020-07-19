const express = require("express");
const logger = require("morgan");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");

// mongo connection
require("../config/mongo.js");

// routes
const indexRouter = require("../routes/index.js").router;
const userRouter = require("../routes/user.js").router;
const chatRoomRouter  = require("../routes/chatRoom.js").router;
const deleteRouter = require("../routes/delete.js").router;

//middlewares
const  {decode}  = require('../middlewares/jwt.js');
// web socket
const  WebSockets  = require('../utils/WebSockets.js');

const app = express();

// Get port from environment and store in Express
const port = process.env.PORT || "3000";
app.set("port", port);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/room", decode,chatRoomRouter);
app.use("/delete", deleteRouter);

// Catch 404 and forward to error handler
app.use('*', (req, res) => {
    return res.status(404).json({
        success: false,
        message: "API endpoint doesn't exists"
    })
});

// Create http server
const server = http.createServer(app);

/** Create socket connection */
global.io = socketio.listen(server);
global.io.on('connection', WebSockets.connection)

// Listen on provided port , on all network interfaces
server.listen(port);

server.on("listening", () => {
    console.log(`Listening on port:: http://localhost:${port}`)
});

module.exports = app;