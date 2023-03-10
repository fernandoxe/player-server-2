import { Server } from 'socket.io';

const io = new Server(5000, {
  cors: {
    origin: [
      'http://localhost:3000'
    ],
  },
});

io.on('connection', (socket) => {
  socket.on('join', (message) => {
    socket.data.user = message.user;
    socket.data.room = message.room;
    socket.join(socket.data.room);
    socket.to(socket.data.room).emit('user-connected', {user: socket.data.user});
    console.log('clients >>>>');
    io.sockets.sockets.forEach(socket => console.log('  >', socket.id, socket.data.user));
  });

  socket.on('play', (message) => {
    console.log('user plays', socket.data.user);
    console.log(socket.data.user, socket.data.room);
    socket.to(socket.data.room).emit('play', {user: message.user});
  });

  socket.on('pause', (message) => {
    console.log('user paused', socket.data.user);
    console.log(socket.data.user, socket.data.room);
    socket.to(socket.data.room).emit('pause', {user: message.user});
  });

  socket.on('disconnect', (reason) => {
    console.log('socket disconnect', socket.id, reason);
  });
});
