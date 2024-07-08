import './instrument';
import { Server } from 'socket.io';
import { originList } from './config';

interface UserI {
  id: string;
  name: string;
  currentTime: number;
}

const io = new Server(5000, {
  cors: {
    origin: originList,
  },
  serveClient: false,
  path: '/ws/socket.io',
});

io.on('connection', (socket) => {
  socket.on('join', async (message) => {
    socket.data.user = message.user;
    socket.data.room = message.room;
    socket.data.currentTime = message.currentTime;
    socket.join(socket.data.room);

    const users = await getUsersInSameRoom(socket.data.room);

    socket.emit('connected', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      room: socket.data.room,
      users: users,
    });

    socket.to(socket.data.room).emit('user-connected', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      room: socket.data.room,
      users: users,
    });
  });

  socket.on('play', (message) => {
    socket.to(socket.data.room).emit('play', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      currentTime: message.currentTime,
    });
  });

  socket.on('pause', (message) => {
    socket.to(socket.data.room).emit('pause', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      currentTime: message.currentTime,
    });
  });

  socket.on('change-time', (message) => {
    socket.to(socket.data.room).emit('change-time', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      currentTime: message.currentTime,
    });
  });

  socket.on('reaction', (message) => {
    socket.to(socket.data.room).emit('reaction', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      currentTime: message.currentTime,
      reaction: message.reaction,
    });
  });

  socket.on('check', async (message) => {
    socket.data.currentTime = message.currentTime;
    const users = await getUsersInSameRoom(socket.data.room);
    socket.emit('check', {
      users: users,
    });
  });

  socket.on('change-user', async (message) => {
    socket.data.user = message.user;
    const users = await getUsersInSameRoom(socket.data.room);

    socket.emit('change-user', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      room: socket.data.room,
      users: users,
    });

    socket.to(socket.data.room).emit('change-user', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      room: socket.data.room,
      users: users,
    });
  });

  socket.on('disconnect', async (reason) => {
    const users = await getUsersInSameRoom(socket.data.room);
    socket.to(socket.data.room).emit('user-disconnected', {
      user: {
        id: socket.id,
        name: socket.data.user,
      },
      room: socket.data.room,
      users: users,
    });
  });
});

const getUsersInSameRoom = async (room: string) => {
  const users: UserI[] = [];
  const socketsInSameRoom = await io.in(room).fetchSockets();
  socketsInSameRoom.forEach(socket => {
    users.push({
      id: socket.id,
      name: socket.data.user,
      currentTime: socket.data.currentTime,
    });
  });
  return users;
}

