import { Server } from 'socket.io';

interface User {
  id: string;
  user: string;
}

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
    const users: User[] = [];
    io.in(socket.data.room).fetchSockets().then(sockets => {
      sockets.forEach(socket => {
        users.push({
          id: socket.data.id,
          user: socket.data.user,
        });
      });
      socket.emit('connected', {
        user: socket.data.user,
        room: socket.data.room,
        usersInRoom: users,
      });
      socket.to(socket.data.room).emit('user-connected', {
        user: socket.data.user,
        room: socket.data.room,
        usersInRoom: users,
      });
    });
  });

  socket.on('play', (message) => {
    socket.to(socket.data.room).emit('play', {
      user: message.user,
      currentTime: message.currentTime,
    });
  });

  socket.on('pause', (message) => {
    socket.to(socket.data.room).emit('pause', {
      user: message.user,
      currentTime: message.currentTime,
    });
  });

  socket.on('change-time', (message) => {
    socket.to(socket.data.room).emit('change-time', {
      user: message.user,
      currentTime: message.currentTime,
    });
  });

  socket.on('disconnect', (reason) => {
    const users: User[] = [];
    io.in(socket.data.room).fetchSockets().then(sockets => {
      sockets.forEach(socket => {
        users.push({
          id: socket.data.id,
          user: socket.data.user,
        });
      });
      socket.to(socket.data.room).emit('user-disconnected', {
        user: socket.data.user,
        room: socket.data.room,
        usersInRoom: users,
      });
    });
  });
});
