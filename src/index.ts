import { Server } from 'socket.io';
import { originList } from './config';

interface User {
  id: string;
  user: string;
}

const io = new Server(5010, {
  cors: {
    origin: originList,
  },
});

io.on('connection', (socket) => {
  socket.on('join', async (message) => {
    socket.data.user = message.user;
    socket.data.room = message.room;
    socket.join(socket.data.room);

    const users = await getUsersInSameRoom(socket.data.room);

    socket.emit('connected', {
      user: socket.data.user,
      room: socket.data.room,
      users: users,
    });

    socket.to(socket.data.room).emit('user-connected', {
      user: socket.data.user,
      room: socket.data.room,
      users: users,
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

  socket.on('reaction', (message) => {
    socket.to(socket.data.room).emit('reaction', {
      user: message.user,
      currentTime: message.currentTime,
      reaction: message.reaction,
      position: message.position,
    });
  });

  socket.on('change-user', async (message) => {
    socket.data.user = message.user;
    const users = await getUsersInSameRoom(socket.data.room);

    socket.emit('change-user', {
      user: socket.data.user,
      room: socket.data.room,
      users: users,
    });

    socket.to(socket.data.room).emit('change-user', {
      user: socket.data.user,
      room: socket.data.room,
      users: users,
    });
  });

  socket.on('disconnect', async (reason) => {
    const users = await getUsersInSameRoom(socket.data.room);
    socket.to(socket.data.room).emit('user-disconnected', {
      user: socket.data.user,
      room: socket.data.room,
      users: users,
    });
  });
});

const getUsersInSameRoom = async (room: string) => {
  const users: User[] = [];
  const socketsInSameRoom = await io.in(room).fetchSockets();
  socketsInSameRoom.forEach(socket => {
    users.push({
      id: socket.id,
      user: socket.data.user,
    });
  });
  return users;
}

