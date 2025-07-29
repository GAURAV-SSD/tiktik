const jwt = require('jsonwebtoken');
const User = require('../models/User');

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.user.username} (${socket.userId})`);

    // Update user online status
    socket.user.isOnline = true;
    socket.user.updateLastActive();

    // Join user to their personal room
    socket.join(socket.userId);

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`🔌 User disconnected: ${socket.user.username} (${socket.userId})`);
      
      // Update user offline status
      try {
        await User.findByIdAndUpdate(socket.userId, { 
          isOnline: false,
          lastActive: new Date()
        });
      } catch (error) {
        console.error('Error updating user offline status:', error);
      }
    });

    // Placeholder for chat events
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Placeholder for typing indicators
    socket.on('typing', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.userId,
        username: socket.user.username
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.io server initialized');
};

module.exports = socketHandler;