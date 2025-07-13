module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MESSAGE_PAGINATION_LIMIT: 50,
  TYPING_TIMEOUT: 3000, // 3 seconds
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  MAX_ROOMS_PER_USER: 10,
  MAX_MESSAGE_LENGTH: 1000
};
