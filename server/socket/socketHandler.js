const { UserStore } = require('../models/User');
const { MessageStore } = require('../models/Message');
const { RoomStore } = require('../models/Room');
const { validateUser, validateMessage, validateRoom } = require('../utils/validation');
const { generateAvatar } = require('../utils/avatarGenerator');

// Initialize stores
const userStore = new UserStore();
const messageStore = new MessageStore();
const roomStore = new RoomStore();

// Create default rooms
const defaultRooms = [
  {
    id: 'general',
    name: 'General',
    description: 'General discussion room',
    icon: '💬',
    ownerId: 'system',
    isPrivate: false
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Random conversations',
    icon: '🎲',
    ownerId: 'system',
    isPrivate: false
  },
  {
    id: 'tech',
    name: 'Tech Talk',
    description: 'Technology discussions',
    icon: '💻',
    ownerId: 'system',
    isPrivate: false
  }
];

// Create default rooms
defaultRooms.forEach(roomData => {
  roomStore.createRoom(roomData);
});

let typingTimeouts = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`📱 User connected: ${socket.id}`);

    // User authentication/login
    socket.on('user:login', (userData, callback) => {
      try {
        const validation = validateUser(userData);
        if (!validation.isValid) {
          return callback({ error: validation.error });
        }

        let user = userStore.getUserByUsername(userData.username);
        
        if (!user) {
          // Create new user
          user = userStore.createUser({
            username: userData.username,
            email: userData.email,
            avatar: generateAvatar(userData.username)
          });
        }

        // Update user status and socket
        user.updateStatus('online');
        userStore.updateUserSocketId(user.id, socket.id);

        // Join default room
        const defaultRoom = roomStore.getRoomById('general');
        defaultRoom.join(user.id);
        user.setCurrentRoom('general');
        socket.join('general');

        // Send user data back
        callback({ user: user.toJSON() });

        // Notify others about user coming online
        socket.broadcast.emit('user:online', {
          userId: user.id,
          username: user.username,
          avatar: user.avatar
        });

        // Send initial data
        socket.emit('rooms:list', roomStore.getAllRooms().map(room => room.toJSON()));
        socket.emit('users:online', userStore.getOnlineUsers().map(u => u.toJSON()));

        console.log(`✅ User logged in: ${user.username}`);
      } catch (error) {
        console.error('Login error:', error);
        callback({ error: 'Login failed' });
      }
    });

    // Join room
    socket.on('room:join', (data, callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const room = roomStore.getRoomById(data.roomId);
        if (!room) {
          return callback({ error: 'Room not found' });
        }

        // Leave previous room
        if (user.currentRoom) {
          const previousRoom = roomStore.getRoomById(user.currentRoom);
          if (previousRoom) {
            previousRoom.leave(user.id);
            socket.leave(user.currentRoom);
            socket.to(user.currentRoom).emit('room:user_left', {
              userId: user.id,
              username: user.username,
              roomId: user.currentRoom
            });
          }
        }

        // Join new room
        room.join(user.id);
        user.setCurrentRoom(room.id);
        socket.join(room.id);

        // Send room messages
        const messages = messageStore.getMessagesByRoom(room.id);
        socket.emit('messages:history', messages.map(msg => msg.toJSON()));

        // Notify others in room
        socket.to(room.id).emit('room:user_joined', {
          userId: user.id,
          username: user.username,
          avatar: user.avatar,
          roomId: room.id
        });

        // Send updated room info
        socket.emit('room:joined', room.toJSON());
        
        callback({ success: true, room: room.toJSON() });
      } catch (error) {
        console.error('Join room error:', error);
        callback({ error: 'Failed to join room' });
      }
    });

    // Send message
    socket.on('message:send', (data, callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const validation = validateMessage(data);
        if (!validation.isValid) {
          return callback({ error: validation.error });
        }

        const messageData = {
          senderId: user.id,
          senderUsername: user.username,
          content: data.content,
          type: data.type || 'text',
          roomId: data.roomId || user.currentRoom,
          isPrivate: data.isPrivate || false,
          recipientId: data.recipientId || null,
          replyTo: data.replyTo || null,
          fileData: data.fileData || null
        };

        const message = messageStore.createMessage(messageData);

        if (message.isPrivate) {
          // Private message
          const recipient = userStore.getUserById(message.recipientId);
          if (recipient && recipient.socketId) {
            socket.to(recipient.socketId).emit('message:private', message.toJSON());
          }
          socket.emit('message:private', message.toJSON());
        } else {
          // Room message
          const room = roomStore.getRoomById(message.roomId);
          if (room) {
            io.to(message.roomId).emit('message:new', message.toJSON());
            
            // Clear typing indicator
            room.removeTypingUser(user.id);
            socket.to(message.roomId).emit('typing:stop', {
              userId: user.id,
              username: user.username,
              roomId: message.roomId
            });
          }
        }

        callback({ success: true, message: message.toJSON() });
      } catch (error) {
        console.error('Send message error:', error);
        callback({ error: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing:start', (data) => {
      const user = userStore.getUserBySocketId(socket.id);
      if (!user) return;

      const room = roomStore.getRoomById(data.roomId);
      if (room) {
        room.addTypingUser(user.id);
        socket.to(data.roomId).emit('typing:start', {
          userId: user.id,
          username: user.username,
          roomId: data.roomId
        });

        // Clear previous timeout
        if (typingTimeouts.has(socket.id)) {
          clearTimeout(typingTimeouts.get(socket.id));
        }

        // Set timeout to stop typing
        const timeout = setTimeout(() => {
          room.removeTypingUser(user.id);
          socket.to(data.roomId).emit('typing:stop', {
            userId: user.id,
            username: user.username,
            roomId: data.roomId
          });
          typingTimeouts.delete(socket.id);
        }, 3000);

        typingTimeouts.set(socket.id, timeout);
      }
    });

    socket.on('typing:stop', (data) => {
      const user = userStore.getUserBySocketId(socket.id);
      if (!user) return;

      const room = roomStore.getRoomById(data.roomId);
      if (room) {
        room.removeTypingUser(user.id);
        socket.to(data.roomId).emit('typing:stop', {
          userId: user.id,
          username: user.username,
          roomId: data.roomId
        });
      }

      // Clear timeout
      if (typingTimeouts.has(socket.id)) {
        clearTimeout(typingTimeouts.get(socket.id));
        typingTimeouts.delete(socket.id);
      }
    });

    // Message reactions
    socket.on('message:react', (data, callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const message = messageStore.getMessageById(data.messageId);
        if (!message) {
          return callback({ error: 'Message not found' });
        }

        message.addReaction(data.emoji, user.id);

        // Broadcast reaction
        const targetRoom = message.isPrivate ? null : message.roomId;
        if (targetRoom) {
          io.to(targetRoom).emit('message:reaction', {
            messageId: message.id,
            emoji: data.emoji,
            userId: user.id,
            username: user.username,
            reactions: message.reactions
          });
        }

        callback({ success: true });
      } catch (error) {
        console.error('Message reaction error:', error);
        callback({ error: 'Failed to add reaction' });
      }
    });

    // Mark message as read
    socket.on('message:read', (data) => {
      const user = userStore.getUserBySocketId(socket.id);
      if (!user) return;

      const message = messageStore.getMessageById(data.messageId);
      if (message) {
        message.markAsRead(user.id);
        
        // Notify sender about read receipt
        const sender = userStore.getUserById(message.senderId);
        if (sender && sender.socketId) {
          socket.to(sender.socketId).emit('message:read_receipt', {
            messageId: message.id,
            readBy: user.id,
            username: user.username
          });
        }
      }
    });

    // Create room
    socket.on('room:create', (data, callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const validation = validateRoom(data);
        if (!validation.isValid) {
          return callback({ error: validation.error });
        }

        const room = roomStore.createRoom({
          name: data.name,
          description: data.description,
          icon: data.icon,
          ownerId: user.id,
          isPrivate: data.isPrivate || false
        });

        // Join creator to room
        room.join(user.id);
        user.setCurrentRoom(room.id);
        socket.join(room.id);

        // Broadcast new room to all users
        socket.broadcast.emit('room:created', room.toJSON());

        callback({ success: true, room: room.toJSON() });
      } catch (error) {
        console.error('Create room error:', error);
        callback({ error: 'Failed to create room' });
      }
    });

    // Search messages
    socket.on('messages:search', (data, callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const results = messageStore.searchMessages(
          data.query,
          data.roomId,
          data.userId
        );

        callback({ 
          success: true, 
          messages: results.map(msg => msg.toJSON()) 
        });
      } catch (error) {
        console.error('Search messages error:', error);
        callback({ error: 'Search failed' });
      }
    });

    // Get user conversations
    socket.on('conversations:get', (callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const conversations = messageStore.getUserConversations(user.id);
        callback({ success: true, conversations });
      } catch (error) {
        console.error('Get conversations error:', error);
        callback({ error: 'Failed to get conversations' });
      }
    });

    // Get private messages
    socket.on('messages:private', (data, callback) => {
      try {
        const user = userStore.getUserBySocketId(socket.id);
        if (!user) {
          return callback({ error: 'User not authenticated' });
        }

        const messages = messageStore.getPrivateMessages(
          user.id,
          data.otherUserId,
          data.limit || 50,
          data.offset || 0
        );

        callback({ 
          success: true, 
          messages: messages.map(msg => msg.toJSON()) 
        });
      } catch (error) {
        console.error('Get private messages error:', error);
        callback({ error: 'Failed to get private messages' });
      }
    });

    // Update user status
    socket.on('user:status', (data) => {
      const user = userStore.getUserBySocketId(socket.id);
      if (user) {
        user.updateStatus(data.status);
        socket.broadcast.emit('user:status_change', {
          userId: user.id,
          username: user.username,
          status: data.status
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = userStore.removeUserSocket(socket.id);
      if (user) {
        console.log(`👋 User disconnected: ${user.username}`);

        // Leave all rooms
        if (user.currentRoom) {
          const room = roomStore.getRoomById(user.currentRoom);
          if (room) {
            room.leave(user.id);
            socket.to(user.currentRoom).emit('room:user_left', {
              userId: user.id,
              username: user.username,
              roomId: user.currentRoom
            });
          }
        }

        // Clear typing timeout
        if (typingTimeouts.has(socket.id)) {
          clearTimeout(typingTimeouts.get(socket.id));
          typingTimeouts.delete(socket.id);
        }

        // Notify others about user going offline
        socket.broadcast.emit('user:offline', {
          userId: user.id,
          username: user.username,
          lastSeen: user.lastSeen
        });
      }
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Cleanup typing indicators periodically
  setInterval(() => {
    const rooms = roomStore.getAllRooms();
    rooms.forEach(room => {
      const typingUsers = room.getActiveTypingUsers();
      typingUsers.forEach(userId => {
        const user = userStore.getUserById(userId);
        if (user && user.socketId) {
          io.to(room.id).emit('typing:cleanup', {
            userId: user.id,
            username: user.username,
            roomId: room.id
          });
        }
      });
    });
  }, 5000);

  console.log('🔌 Socket.io server initialized');
};
