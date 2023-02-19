
const express = require('express')
const app = express()
require('dotenv').config();
const harperSaveMessage = require('./services/harper-save-message'); // Add this
const harperGetMessages = require('./services/harper-get-messages'); // Add this

const leaveRoom = require('./utils/leave-room'); // Add this

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require('cors');

app.use(cors()); // Add cors middleware
const CHAT_BOT = 'ChatBot'
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})
io.on('connection', (socket) => {

socket.on('send_message', (data) => {
  const { message, username, room, __createdtime__ } = data;
  io.in(room).emit('receive_message', data); // Send to all users in room, including sender
  harperSaveMessage(message, username, room, __createdtime__) // Save message in db
    .then((response) => console.log(response))
    .catch((err) => console.log(err));
});
// Add a user to a room
socket.on('join_room', (data) => {
      
  // ...

  // Add this
  // Get last 100 messages sent in the chat room
  harperGetMessages(room)
    .then((last100Messages) => {
      // console.log('latest messages', last100Messages);
      socket.emit('last_100_messages', last100Messages);
    })
    .catch((err) => console.log(err));
});
// Add this
let __createdtime__ = Date.now(); // Current timestamp
// Send message to all users currently in the room, apart from the user that just joined
socket.to(room).emit('receive_message', {
  message: `${username} has joined the chat room`,
  username: CHAT_BOT,
  __createdtime__,
});
// Add this
    // Send welcome msg to user that just joined chat only
    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });
    // Add this
    // Save the new user to the room
    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);
})
  // Add this
  socket.on('leave_room', (data) => {
    const { username, room } = data;
    socket.leave(room);
    const __createdtime__ = Date.now();
    // Remove user from memory
    allUsers = leaveRoom(socket.id, allUsers);
    socket.to(room).emit('chatroom_users', allUsers);
    socket.to(room).emit('receive_message', {
      username: CHAT_BOT,
      message: `${username} has left the chat`,
      __createdtime__,
    });
    console.log(`${username} has left the chat`);
  });
  // Add this
  socket.on('disconnect', () => {
    console.log('User disconnected from the chat');
    const user = allUsers.find((user) => user.id == socket.id);
    if (user?.username) {
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit('chatroom_users', allUsers);
      socket.to(chatRoom).emit('receive_message', {
        message: `${user.username} has disconnected from the chat.`,
      });
    }
  });
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})