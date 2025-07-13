const { v4: uuidv4 } = require('uuid');

class Room {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description || '';
    this.isPrivate = data.isPrivate || false;
    this.password = data.password || null; // If room is password-protected
    this.icon = data.icon || '📢';
    this.ownerId = data.ownerId;
    this.createdAt = data.createdAt || new Date();
    this.participants = data.participants || new Set();
    this.typingUsers = data.typingUsers || new Map(); // userId -> timestamp
  }

  join(userId) {
    this.participants.add(userId);
  }

  leave(userId) {
    this.participants.delete(userId);
    this.typingUsers.delete(userId);
  }

  isUserInRoom(userId) {
    return this.participants.has(userId);
  }

  addTypingUser(userId) {
    this.typingUsers.set(userId, Date.now());
  }

  removeTypingUser(userId) {
    this.typingUsers.delete(userId);
  }

  getActiveTypingUsers() {
    const now = Date.now();
    return Array.from(this.typingUsers.keys()).filter(userId => 
      now - this.typingUsers.get(userId) < 5000 // Last 5 seconds
    );
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isPrivate: this.isPrivate,
      icon: this.icon,
      ownerId: this.ownerId,
      createdAt: this.createdAt,
      participants: Array.from(this.participants),
      activeTypingUsers: this.getActiveTypingUsers()
    };
  }
}

// In-memory storage for rooms
class RoomStore {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomData) {
    const room = new Room(roomData);
    this.rooms.set(room.id, room);
    return room;
  }

  getRoomById(id) {
    return this.rooms.get(id);
  }

  getRoomByName(name) {
    return Array.from(this.rooms.values()).find(room => room.name === name);
  }

  getAllRooms() {
    return Array.from(this.rooms.values());
  }

  deleteRoom(id) {
    return this.rooms.delete(id);
  }

  getUsersRooms(userId) {
    return Array.from(this.rooms.values()).filter(room => room.isUserInRoom(userId));
  }
}

module.exports = { Room, RoomStore };
