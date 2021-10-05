const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server);

app.use('/peerjs', peerServer);

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId, userName);
        socket.on("chat", (message, currentUserId, userName) => {
            console.log(message);
            io.to(roomId).emit("createMessage", message, currentUserId, userName);
        });
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId);
        })
    });
});

let port = 3000;

server.listen(port, () => {
    console.log(`Server Listening on port ${port}`);
});