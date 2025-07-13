const { MAX_MESSAGE_LENGTH } = require('../config/config');

const validateUser = (userData) => {
  if (!userData.username) {
    return { isValid: false, error: 'Username is required' };
  }

  if (userData.username.length < 2 || userData.username.length > 20) {
    return { isValid: false, error: 'Username must be between 2 and 20 characters' };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }

  if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

const validateMessage = (messageData) => {
  if (!messageData.content) {
    return { isValid: false, error: 'Message content is required' };
  }

  if (messageData.content.length > MAX_MESSAGE_LENGTH) {
    return { isValid: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` };
  }

  if (messageData.content.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  return { isValid: true };
};

const validateRoom = (roomData) => {
  if (!roomData.name) {
    return { isValid: false, error: 'Room name is required' };
  }

  if (roomData.name.length < 2 || roomData.name.length > 50) {
    return { isValid: false, error: 'Room name must be between 2 and 50 characters' };
  }

  if (!/^[a-zA-Z0-9\s_-]+$/.test(roomData.name)) {
    return { isValid: false, error: 'Room name can only contain letters, numbers, spaces, underscores, and hyphens' };
  }

  if (roomData.description && roomData.description.length > 200) {
    return { isValid: false, error: 'Room description too long (max 200 characters)' };
  }

  return { isValid: true };
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Basic HTML sanitization
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

module.exports = {
  validateUser,
  validateMessage,
  validateRoom,
  sanitizeInput
};
