const User = require('../../model/user');
const Chat = require('../../model/chat');
const GroupChat = require('../../model/groupChat');
const GroupChatSeen = require('../../model/groupMsgSeen');
const userJoinTag = require('../../model/userJoinTag');

const io = require('socket.io')();
const moment = require('moment-timezone');
const DataStore = require('data-store');
const { generateString } = require('../../utils/helper');

const clientStore = new DataStore({
  path: 'controller/chat/data.json',
});

const userSocketStore = new DataStore({
  path: 'controller/chat/user.json',
});

let rooms = clientStore.get('rooms', []);
let socketUser = userSocketStore.get('users', []);

io.on('connection', (socket) => {
  socket.on('createRoom', async (data) => {
    const { senderId, receiverId, chatType } = data;
    let roomId = '';

    if (data.chatType == 2) {
      {
        const roomExist = rooms.filter((room, index) => {
          if (room.receiverId == receiverId && room.chatType == chatType) {
            rooms[index][room.senderId] = socket.id;
            rooms[index][room.chatType] = chatType;
            roomId = room.roomId;
            return room;
          }
        });

        if (!roomExist.length) {
          roomId = generateString(10);
          rooms.push({
            senderId,
            receiverId,
            roomId,
            [senderId]: socket.id,
            chatType: chatType,
          });
          clientStore.set({ rooms });
        }
      }
    }

    const roomExist = rooms.filter((room, index) => {
      if (room.senderId == senderId && room.receiverId == receiverId && room.chatType == chatType) {
        rooms[index][room.senderId] = socket.id;
        rooms[index][room.chatType] = chatType;
        roomId = room.roomId;
        clientStore.set({ rooms });
        return room;
      } else if (room.senderId == receiverId && room.receiverId == senderId) {
        rooms[index][room.receiverId] = socket.id;
        roomId = room.roomId;
        clientStore.set({ rooms });
        return room;
      }
    });

    if (!roomExist.length) {
      roomId = generateString(10);
      rooms.push({
        senderId,
        receiverId,
        roomId,
        [senderId]: socket.id,
        chatType: data.chatType,
      });
      clientStore.set({ rooms });
    }

    console.log(`Room: ${roomId} is connected.`);
    socket.join(roomId);
    socket.emit('roomConnected', roomId);
  });

  socket.on('UpdateStatusToOnline', async (data) => {
    const { senderId } = data;

    const userStatusUpdate = await User.findByIdAndUpdate(
      { _id: senderId },
      { isOnline: true, lastSeen: null },
      { new: true },
    );

    // Socket user store
    const roomExist = socketUser.filter((room, index) => {
      if (room.userId == data.senderId) {
        socketUser[index].socketId = socket.id;
        userSocketStore.set({ socketUser });
        return room;
      }
    });

    if (!roomExist.length) {
      socketUser.push({ socketId: socket.id, userId: data.senderId });
      userSocketStore.set({ socketUser });
    }

    const responseData = {
      isOnline: true,
      senderId: data.senderId,
    };

    socket.broadcast.emit('statusOnline', responseData);
  });

  socket.on('getOnlineStatus', async (data) => {
    console.log('Get Online status:', data);
    const userData = await User.findById({ _id: data.receiverId });

    if (userData) {
      const responseData = {
        isOnline: userData.isOnline,
        senderId: data.receiverId,
      };
      return io.in(data.roomId).emit('statusOnline', responseData);
    }
  });

  socket.on('typing', function (data) {
    // console.log("Typing:", data);
    socket.broadcast.to(data.roomId).emit('DisplayTyping', data);
  });

  socket.on('removeTyping', function (data) {
    // console.log("Remove typing:", data);
    socket.broadcast.to(data.roomId).emit('removeTyping', data);
  });

  socket.on('sendMessage', async (data) => {
    const MessageTime = moment.tz(Date.now(), 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    if (data.chatType == 2) {
      const groupChatData = await GroupChat.create({
        senderId: data.senderId,
        groupId: data.receiverId,
        message: data.message,
        type: data.type,
        createdAt: MessageTime,
      });

      data.chatId = groupChatData._id;

      const findAllGroupMembar = await userJoinTag.find({
        groupId: data.receiverId,
      });

      for (const data of findAllGroupMembar) {
        await GroupChatSeen.create({
          userId: data.userId,
          groupId: data.groupId,
          seenMessage: false,
        });
      }

      return socket.broadcast.to(data.roomId).emit('newMessage', data);
    }

    const chatData = await Chat.create({
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      type: data.type,
      sendMessage: MessageTime,
    });

    data.chatId = chatData._id;

    return socket.broadcast.to(data.roomId).emit('newMessage', data);
  });

  socket.on('ReadMessage', async function (data) {
    // console.log("Read message =>", data.chatId);
    const MessageTime = moment.tz(Date.now(), 'Asia/Kolkata');

    if (data.chatType == 2) {
      const result = await GroupChatSeen.updateMany(
        {
          userId: data.senderId,
          groupId: data.receiverId,
        },
        {
          $set: {
            seenMessage: true,
          },
        },
        {
          new: true,
        },
      );
    } else {
      await Chat.updateMany(
        {
          senderId: data.senderId,
          receiverId: data.receiverId,
          createdAt: { $lte: new Date() },
        },
        { seenAt: moment.tz(Date.now(), 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') },
        { new: true },
      );
    }

    socket.broadcast.to(data.roomId).emit('seenMessage', data);
  });

  socket.on('disconnected', async (data) => {
    await User.findByIdAndUpdate({ _id: data.senderId }, { isOnline: false });
    console.log(`User ${data.senderId} disconnected from ${data.roomId}`);
  });

  socket.on('disconnect', async () => {
    socketUser.forEach(async (room, index) => {
      let userId = 0;
      const MessageTime = moment.tz(Date.now(), 'Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

      if (room.socketId == socket.id) {
        userId = room.userId;
      }

      if (userId.length > 0) {
        const responseData = {
          isOnline: false,
          senderId: userId,
        };

        await User.findByIdAndUpdate({ _id: userId }, { isOnline: false, lastSeen: MessageTime });

        io.in(room.roomId).emit('statusOffline', responseData);
      }
    });
    console.log('disconnected:', socket.id);
  });

  socket.on('error', (error) => {
    console.log(error, 'Socket error');
  });
});

module.exports = io;
