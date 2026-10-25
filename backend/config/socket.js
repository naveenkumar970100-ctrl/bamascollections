import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io = null;

/**
 * Initialize Socket.IO on the HTTP server with JWT authentication
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all local dev and production origins
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.replace('Bearer ', ''));

      if (token) {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'bamas_collections_jwt_secret_key_2026'
        );
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          socket.user = user;
        }
      }
    } catch (err) {
      // Allow unauthenticated connection for guest inquiries & public broadcasts
      socket.user = null;
    }
    next();
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const socketId = socket.id;

    if (user) {
      const userId = user._id.toString();
      socket.join(`user:${userId}`);
      console.log(`🔌 [WebSocket]: Authenticated user connected -> ${user.name} (${user.role}) [${socketId}]`);

      if (user.role === 'admin') {
        socket.join('room:admins');
        console.log(`👑 [WebSocket]: Admin joined room:admins -> ${user.email} [${socketId}]`);
      }
    } else {
      console.log(`🔌 [WebSocket]: Guest client connected [${socketId}]`);
    }

    // Client explicitly joins an inquiry/conversation room
    socket.on('join_chat', (chatId) => {
      if (chatId) {
        socket.join(`chat:${chatId}`);
        console.log(`💬 [WebSocket]: Client joined chat:${chatId}`);
      }
    });

    socket.on('leave_chat', (chatId) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`💬 [WebSocket]: Client left chat:${chatId}`);
      }
    });

    // Real-time typing indicators
    socket.on('typing', ({ chatId, senderName }) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit('user_typing', { chatId, senderName });
      }
    });

    socket.on('stop_typing', ({ chatId }) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit('user_stop_typing', { chatId });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 [WebSocket]: Client disconnected [${socketId}] (${reason})`);
    });
  });

  console.log('⚡ [WebSocket]: Socket.IO Engine initialized successfully');
  return io;
};

/**
 * Get Socket.IO instance
 */
export const getIO = () => {
  if (!io) {
    console.warn('⚠️ [WebSocket]: getIO called before initSocket');
  }
  return io;
};

/**
 * Emit event to all connected administrators
 */
export const emitToAdmins = (event, data) => {
  if (io) {
    io.to('room:admins').emit(event, data);
    console.log(`📢 [WebSocket -> Admins]: ${event}`);
  }
};

/**
 * Emit event to a specific authenticated user
 */
export const emitToUser = (userId, event, data) => {
  if (io && userId) {
    const id = userId.toString();
    io.to(`user:${id}`).emit(event, data);
    console.log(`📢 [WebSocket -> User ${id}]: ${event}`);
  }
};

/**
 * Emit event to a specific direct chat/inquiry room
 */
export const emitToChat = (chatId, event, data) => {
  if (io && chatId) {
    const id = chatId.toString();
    io.to(`chat:${id}`).emit(event, data);
    console.log(`📢 [WebSocket -> Chat ${id}]: ${event}`);
  }
};

/**
 * Broadcast event to all connected clients
 */
export const emitBroadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📢 [WebSocket -> Broadcast]: ${event}`);
  }
};
