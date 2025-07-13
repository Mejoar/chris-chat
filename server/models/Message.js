const { v4: uuidv4 } = require('uuid');

class Message {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.senderId = data.senderId;
    this.senderUsername = data.senderUsername;
    this.content = data.content;
    this.type = data.type || 'text'; // text, image, file, system
    this.roomId = data.roomId;
    this.timestamp = data.timestamp || new Date();
    this.edited = data.edited || false;
    this.editedAt = data.editedAt || null;
    this.reactions = data.reactions || new Map(); // emoji -> Set of user IDs
    this.readBy = data.readBy || new Set(); // Set of user IDs who read the message
    this.fileData = data.fileData || null; // For file/image messages
    this.replyTo = data.replyTo || null; // Message ID this is replying to
    this.isPrivate = data.isPrivate || false;
    this.recipientId = data.recipientId || null; // For private messages
  }

  addReaction(emoji, userId) {
    if (!this.reactions.has(emoji)) {
      this.reactions.set(emoji, new Set());
    }
    this.reactions.get(emoji).add(userId);
  }

  removeReaction(emoji, userId) {
    if (this.reactions.has(emoji)) {
      this.reactions.get(emoji).delete(userId);
      if (this.reactions.get(emoji).size === 0) {
        this.reactions.delete(emoji);
      }
    }
  }

  markAsRead(userId) {
    this.readBy.add(userId);
  }

  edit(newContent) {
    this.content = newContent;
    this.edited = true;
    this.editedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      senderId: this.senderId,
      senderUsername: this.senderUsername,
      content: this.content,
      type: this.type,
      roomId: this.roomId,
      timestamp: this.timestamp,
      edited: this.edited,
      editedAt: this.editedAt,
      reactions: Object.fromEntries(
        Array.from(this.reactions.entries()).map(([emoji, users]) => [
          emoji,
          Array.from(users)
        ])
      ),
      readBy: Array.from(this.readBy),
      fileData: this.fileData,
      replyTo: this.replyTo,
      isPrivate: this.isPrivate,
      recipientId: this.recipientId
    };
  }
}

// In-memory storage for messages
class MessageStore {
  constructor() {
    this.messages = new Map();
    this.messagesByRoom = new Map();
    this.privateMessages = new Map(); // userId -> Map of conversationId -> messages
  }

  createMessage(messageData) {
    const message = new Message(messageData);
    this.messages.set(message.id, message);

    if (message.isPrivate) {
      // Store private message
      const conversationId = this.getConversationId(message.senderId, message.recipientId);
      if (!this.privateMessages.has(conversationId)) {
        this.privateMessages.set(conversationId, []);
      }
      this.privateMessages.get(conversationId).push(message);
    } else {
      // Store room message
      if (!this.messagesByRoom.has(message.roomId)) {
        this.messagesByRoom.set(message.roomId, []);
      }
      this.messagesByRoom.get(message.roomId).push(message);
    }

    return message;
  }

  getMessageById(id) {
    return this.messages.get(id);
  }

  getMessagesByRoom(roomId, limit = 50, offset = 0) {
    const messages = this.messagesByRoom.get(roomId) || [];
    return messages
      .slice(-limit - offset, -offset || undefined)
      .reverse();
  }

  getPrivateMessages(userId1, userId2, limit = 50, offset = 0) {
    const conversationId = this.getConversationId(userId1, userId2);
    const messages = this.privateMessages.get(conversationId) || [];
    return messages
      .slice(-limit - offset, -offset || undefined)
      .reverse();
  }

  searchMessages(query, roomId = null, userId = null) {
    let messages = Array.from(this.messages.values());
    
    // Filter by room or user
    if (roomId) {
      messages = messages.filter(msg => msg.roomId === roomId);
    }
    if (userId) {
      messages = messages.filter(msg => msg.senderId === userId);
    }

    // Search in content
    const searchTerm = query.toLowerCase();
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(searchTerm) ||
      msg.senderUsername.toLowerCase().includes(searchTerm)
    );
  }

  getConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  getUserConversations(userId) {
    const conversations = [];
    for (const [conversationId, messages] of this.privateMessages) {
      if (conversationId.includes(userId)) {
        const otherUserId = conversationId.split('_').find(id => id !== userId);
        const lastMessage = messages[messages.length - 1];
        conversations.push({
          conversationId,
          otherUserId,
          lastMessage,
          unreadCount: messages.filter(msg => 
            msg.senderId !== userId && !msg.readBy.has(userId)
          ).length
        });
      }
    }
    return conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );
  }

  deleteMessage(messageId) {
    const message = this.messages.get(messageId);
    if (message) {
      this.messages.delete(messageId);
      
      if (message.isPrivate) {
        const conversationId = this.getConversationId(message.senderId, message.recipientId);
        const messages = this.privateMessages.get(conversationId) || [];
        const index = messages.findIndex(msg => msg.id === messageId);
        if (index > -1) {
          messages.splice(index, 1);
        }
      } else {
        const messages = this.messagesByRoom.get(message.roomId) || [];
        const index = messages.findIndex(msg => msg.id === messageId);
        if (index > -1) {
          messages.splice(index, 1);
        }
      }
    }
    return message;
  }

  getUnreadMessagesCount(userId, roomId = null) {
    let messages = Array.from(this.messages.values());
    
    if (roomId) {
      messages = messages.filter(msg => msg.roomId === roomId);
    }
    
    return messages.filter(msg => 
      msg.senderId !== userId && !msg.readBy.has(userId)
    ).length;
  }
}

module.exports = { Message, MessageStore };
