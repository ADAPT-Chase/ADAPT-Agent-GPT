const User = require('./models/User');

const socketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join', async ({ userId }) => {
      try {
        const user = await User.findByPk(userId);
        if (user) {
          socket.join(`user-${userId}`);
          console.log(`User ${userId} joined their room`);
        }
      } catch (error) {
        console.error('Error joining user room:', error);
      }
    });

    socket.on('message', async ({ userId, message }) => {
      try {
        const user = await User.findByPk(userId);
        if (user) {
          io.to(`user-${userId}`).emit('message', {
            userId,
            username: user.username,
            message,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

module.exports = socketHandlers;