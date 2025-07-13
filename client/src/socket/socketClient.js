import { io } from 'socket.io-client';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5003';

class SocketClient {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    this.eventListeners = new Map();
  }

  connect(token = null) {
    if (this.socket) {
      return Promise.resolve();
    }

    console.log('🔌 Attempting to connect to:', SERVER_URL);
    return new Promise((resolve, reject) => {
      this.socket = io(SERVER_URL, {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 20000,
        auth: token ? { token } : {}
      });

      this.socket.on('connect', () => {
        console.log('🔌 Connected to server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Register all pending event listeners
        this.eventListeners.forEach((callback, event) => {
          this.socket.on(event, callback);
        });
        
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        this.isConnected = false;
        
        // Attempt to reconnect
        if (reason === 'io server disconnect') {
          this.socket.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
        this.isConnected = false;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Max reconnection attempts reached'));
        } else {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.socket.connect();
          }, 1000 * this.reconnectAttempts);
        }
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Re-register event listeners
        this.eventListeners.forEach((callback, event) => {
          this.socket.on(event, callback);
        });
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('❌ Reconnection error:', error);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('❌ Reconnection failed');
        this.isConnected = false;
      });

      this.socket.connect();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventListeners.clear();
    }
  }

  emit(event, data, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
      return;
    }

    if (callback) {
      this.socket.emit(event, data, callback);
    } else {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    // Always store the listener for later registration
    this.eventListeners.set(event, callback);
    
    // If socket is ready, register immediately
    if (this.socket) {
      this.socket.on(event, callback);
    }
    // If socket is not ready, it will be registered on connect/reconnect
  }

  off(event, callback) {
    if (!this.socket) {
      return;
    }

    this.eventListeners.delete(event);
    this.socket.off(event, callback);
  }

  // Authentication methods
  login(userData) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('user:login', userData, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Room methods
  joinRoom(roomId) {
    return new Promise((resolve, reject) => {
      this.emit('room:join', { roomId }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  createRoom(roomData) {
    return new Promise((resolve, reject) => {
      this.emit('room:create', roomData, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Message methods
  sendMessage(messageData) {
    return new Promise((resolve, reject) => {
      this.emit('message:send', messageData, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  reactToMessage(messageId, emoji) {
    return new Promise((resolve, reject) => {
      this.emit('message:react', { messageId, emoji }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  markMessageAsRead(messageId) {
    this.emit('message:read', { messageId });
  }

  searchMessages(query, roomId, userId) {
    return new Promise((resolve, reject) => {
      this.emit('messages:search', { query, roomId, userId }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Private message methods
  getPrivateMessages(otherUserId, limit, offset) {
    return new Promise((resolve, reject) => {
      this.emit('messages:private', { otherUserId, limit, offset }, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  getUserConversations() {
    return new Promise((resolve, reject) => {
      this.emit('conversations:get', (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Typing methods
  startTyping(roomId) {
    this.emit('typing:start', { roomId });
  }

  stopTyping(roomId) {
    this.emit('typing:stop', { roomId });
  }

  // Status methods
  updateStatus(status) {
    this.emit('user:status', { status });
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
