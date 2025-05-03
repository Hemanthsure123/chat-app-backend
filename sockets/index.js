const User = require('../models/User');
const Message = require('../models/Message');
const ReadReceipt = require('../models/ReadReceipt');

const setupSockets = (io) => {
  const users = new Map(); // Track online users

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', async ({ userId, token }) => {
      try {
        const user = await User.findByPk(userId);
        if (!user) return socket.disconnect();

        users.set(userId, socket.id);
        await user.update({ status: 'online' });
        io.emit('userStatus', { userId, status: 'online' });

        socket.userId = userId;
      } catch (err) {
        socket.disconnect();
      }
    });

    socket.on('joinRoom', ({ roomId }) => {
      socket.join(`room:${roomId}`);
      io.to(`room:${roomId}`).emit('userJoined', { userId: socket.userId, roomId });
    });

    socket.on('joinConversation', ({ conversationId }) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('sendMessage', async ({ roomId, conversationId, content, type }) => {
      try {
        const message = await Message.create({
          content,
          type,
          senderId: socket.userId,
          roomId: roomId || null,
          conversationId: conversationId || null,
        });

        const messageWithSender = await Message.findByPk(message.id, {
          include: [{ model: User, as: 'sender' }],
        });

        if (roomId) {
          io.to(`room:${roomId}`).emit('message', messageWithSender);
        } else if (conversationId) {
          io.to(`conversation:${conversationId}`).emit('message', messageWithSender);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('editMessage', async ({ messageId, content }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (message.senderId !== socket.userId) return;

        await message.update({ content, edited: true });

        if (message.roomId) {
          io.to(`room:${message.roomId}`).emit('messageEdited', message);
        } else if (message.conversationId) {
          io.to(`conversation:${message.conversationId}`).emit('messageEdited', message);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('deleteMessage', async ({ messageId }) => {
      try {
        const message = await Message.findByPk(messageId);
        if (message.senderId !== socket.userId) return;

        await message.update({ deleted: true });

        if (message.roomId) {
          io.to(`room:${message.roomId}`).emit('messageDeleted', messageId);
        } else if (message.conversationId) {
          io.to(`conversation:${message.conversationId}`).emit('messageDeleted', messageId);
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('typing', ({ roomId, conversationId }) => {
      if (roomId) {
        socket.to(`room:${roomId}`).emit('typing', { userId: socket.userId });
      } else if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('typing', { userId: socket.userId });
      }
    });

    socket.on('readMessage', async ({ messageId, conversationId }) => {
      try {
        const receipt = await ReadReceipt.create({
          userId: socket.userId,
          messageId,
        });
        io.to(`conversation:${conversationId}`).emit('messageRead', {
          messageId,
          userId: socket.userId,
        });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('mention', ({ userId, roomId, conversationId }) => {
      const targetSocketId = users.get(userId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('mention', {
          from: socket.userId,
          roomId,
          conversationId,
        });
      }
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        const user = await User.findByPk(socket.userId);
        if (user) {
          await user.update({ status: 'offline' });
          io.emit('userStatus', { userId: socket.userId, status: 'offline' });
        }
        users.delete(socket.userId);
      }
    });
  });
};

module.exports = setupSockets;