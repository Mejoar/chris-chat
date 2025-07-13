const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.avatar = data.avatar || null;
    this.status = data.status || 'offline'; // online, offline, away, busy
    this.lastSeen = data.lastSeen || new Date();
    this.joinedAt = data.joinedAt || new Date();
    this.socketId = data.socketId || null;
    this.currentRoom = data.currentRoom || null;
    this.isTyping = data.isTyping || false;
    this.typingInRoom = data.typingInRoom || null;
  }

  updateStatus(status) {
    this.status = status;
    this.lastSeen = new Date();
  }

  setSocketId(socketId) {
    this.socketId = socketId;
  }

  setCurrentRoom(roomId) {
    this.currentRoom = roomId;
  }

  setTyping(isTyping, roomId = null) {
    this.isTyping = isTyping;
    this.typingInRoom = roomId;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      status: this.status,
      lastSeen: this.lastSeen,
      joinedAt: this.joinedAt,
      currentRoom: this.currentRoom,
      isTyping: this.isTyping,
      typingInRoom: this.typingInRoom
    };
  }
}

// In-memory storage for users
class UserStore {
  constructor() {
    this.users = new Map();
    this.usersBySocketId = new Map();
    this.usersByUsername = new Map();
  }

  createUser(userData) {
    const user = new User(userData);
    this.users.set(user.id, user);
    this.usersByUsername.set(user.username, user);
    return user;
  }

  getUserById(id) {
    return this.users.get(id);
  }

  getUserByUsername(username) {
    return this.usersByUsername.get(username);
  }

  getUserBySocketId(socketId) {
    return this.usersBySocketId.get(socketId);
  }

  updateUserSocketId(userId, socketId) {
    const user = this.users.get(userId);
    if (user) {
      // Remove old socket mapping
      if (user.socketId) {
        this.usersBySocketId.delete(user.socketId);
      }
      // Add new socket mapping
      user.setSocketId(socketId);
      this.usersBySocketId.set(socketId, user);
    }
    return user;
  }

  removeUserSocket(socketId) {
    const user = this.usersBySocketId.get(socketId);
    if (user) {
      user.setSocketId(null);
      user.updateStatus('offline');
      this.usersBySocketId.delete(socketId);
    }
    return user;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  getOnlineUsers() {
    return Array.from(this.users.values()).filter(user => user.status === 'online');
  }

  getUsersInRoom(roomId) {
    return Array.from(this.users.values()).filter(user => user.currentRoom === roomId);
  }

  deleteUser(userId) {
    const user = this.users.get(userId);
    if (user) {
      this.users.delete(userId);
      this.usersByUsername.delete(user.username);
      if (user.socketId) {
        this.usersBySocketId.delete(user.socketId);
      }
    }
    return user;
  }
}

module.exports = { User, UserStore };
