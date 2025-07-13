import React, { createContext, useContext, useReducer, useEffect } from 'react';
import socketClient from '../socket/socketClient';
import { toast } from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  rooms: [],
  currentRoom: null,
  messages: [],
  privateMessages: new Map(),
  onlineUsers: [],
  typingUsers: [],
  notifications: [],
  isConnected: false,
  isLoading: false,
  error: null,
  conversations: [],
  searchResults: []
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_ROOMS: 'SET_ROOMS',
  ADD_ROOM: 'ADD_ROOM',
  SET_CURRENT_ROOM: 'SET_CURRENT_ROOM',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  UPDATE_MESSAGE: 'UPDATE_MESSAGE',
  ADD_PRIVATE_MESSAGE: 'ADD_PRIVATE_MESSAGE',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  UPDATE_USER_STATUS: 'UPDATE_USER_STATUS',
  SET_TYPING_USERS: 'SET_TYPING_USERS',
  ADD_TYPING_USER: 'ADD_TYPING_USER',
  REMOVE_TYPING_USER: 'REMOVE_TYPING_USER',
  SET_CONNECTED: 'SET_CONNECTED',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  CLEAR_SEARCH_RESULTS: 'CLEAR_SEARCH_RESULTS'
};

// Reducer function
const chatReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case ActionTypes.SET_ROOMS:
      return { ...state, rooms: action.payload };
    
    case ActionTypes.ADD_ROOM:
      return { ...state, rooms: [...state.rooms, action.payload] };
    
    case ActionTypes.SET_CURRENT_ROOM:
      return { ...state, currentRoom: action.payload };
    
    case ActionTypes.SET_MESSAGES:
      return { ...state, messages: action.payload };
    
    case ActionTypes.ADD_MESSAGE:
      return { 
        ...state, 
        messages: [...state.messages, action.payload] 
      };
    
    case ActionTypes.UPDATE_MESSAGE:
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id ? { ...msg, ...action.payload } : msg
        )
      };
    
    case ActionTypes.ADD_PRIVATE_MESSAGE:
      const { conversationId, message } = action.payload;
      const updatedPrivateMessages = new Map(state.privateMessages);
      const existingMessages = updatedPrivateMessages.get(conversationId) || [];
      updatedPrivateMessages.set(conversationId, [...existingMessages, message]);
      return { ...state, privateMessages: updatedPrivateMessages };
    
    case ActionTypes.SET_ONLINE_USERS:
      return { ...state, onlineUsers: action.payload };
    
    case ActionTypes.UPDATE_USER_STATUS:
      return {
        ...state,
        onlineUsers: state.onlineUsers.map(user =>
          user.id === action.payload.userId 
            ? { ...user, status: action.payload.status }
            : user
        )
      };
    
    case ActionTypes.SET_TYPING_USERS:
      return { ...state, typingUsers: action.payload };
    
    case ActionTypes.ADD_TYPING_USER:
      return {
        ...state,
        typingUsers: [...state.typingUsers.filter(u => u.userId !== action.payload.userId), action.payload]
      };
    
    case ActionTypes.REMOVE_TYPING_USER:
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.userId !== action.payload.userId)
      };
    
    case ActionTypes.SET_CONNECTED:
      return { ...state, isConnected: action.payload };
    
    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ActionTypes.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case ActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ActionTypes.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload };
    
    case ActionTypes.SET_SEARCH_RESULTS:
      return { ...state, searchResults: action.payload };
    
    case ActionTypes.CLEAR_SEARCH_RESULTS:
      return { ...state, searchResults: [] };
    
    default:
      return state;
  }
};

// Create context
const ChatContext = createContext();

// Provider component
export const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Socket event handlers
  useEffect(() => {
    const handleConnect = () => {
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: true });
      dispatch({ type: ActionTypes.SET_ERROR, payload: null });
    };

    const handleDisconnect = () => {
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
    };

    const handleRoomsList = (rooms) => {
      dispatch({ type: ActionTypes.SET_ROOMS, payload: rooms });
    };

    const handleRoomCreated = (room) => {
      dispatch({ type: ActionTypes.ADD_ROOM, payload: room });
      toast.success(`New room "${room.name}" created!`);
    };

    const handleRoomJoined = (room) => {
      dispatch({ type: ActionTypes.SET_CURRENT_ROOM, payload: room });
    };

    const handleMessagesHistory = (messages) => {
      dispatch({ type: ActionTypes.SET_MESSAGES, payload: messages });
    };

    const handleNewMessage = (message) => {
      dispatch({ type: ActionTypes.ADD_MESSAGE, payload: message });
      
      // Show notification if message is not from current user
      if (message.senderId !== state.user?.id) {
        const notification = {
          id: Date.now(),
          type: 'message',
          title: 'New Message',
          message: `${message.senderUsername}: ${message.content}`,
          timestamp: new Date()
        };
        dispatch({ type: ActionTypes.ADD_NOTIFICATION, payload: notification });
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${message.senderUsername}`, {
            body: message.content,
            icon: '/favicon.ico'
          });
        }
      }
    };

    const handlePrivateMessage = (message) => {
      const conversationId = [message.senderId, message.recipientId].sort().join('_');
      dispatch({ 
        type: ActionTypes.ADD_PRIVATE_MESSAGE, 
        payload: { conversationId, message } 
      });
      
      // Show notification for private message
      if (message.senderId !== state.user?.id) {
        toast.success(`Private message from ${message.senderUsername}`);
      }
    };

    const handleMessageReaction = (data) => {
      dispatch({
        type: ActionTypes.UPDATE_MESSAGE,
        payload: {
          id: data.messageId,
          reactions: data.reactions
        }
      });
    };

    const handleOnlineUsers = (users) => {
      dispatch({ type: ActionTypes.SET_ONLINE_USERS, payload: users });
    };

    const handleUserOnline = (userData) => {
      dispatch({ 
        type: ActionTypes.SET_ONLINE_USERS, 
        payload: [...state.onlineUsers, userData] 
      });
      toast.success(`${userData.username} joined the chat`);
    };

    const handleUserOffline = (userData) => {
      dispatch({ 
        type: ActionTypes.SET_ONLINE_USERS, 
        payload: state.onlineUsers.filter(u => u.id !== userData.userId) 
      });
      toast(`${userData.username} left the chat`);
    };

    const handleUserStatusChange = (data) => {
      dispatch({ 
        type: ActionTypes.UPDATE_USER_STATUS, 
        payload: data 
      });
    };

    const handleTypingStart = (data) => {
      dispatch({ type: ActionTypes.ADD_TYPING_USER, payload: data });
    };

    const handleTypingStop = (data) => {
      dispatch({ type: ActionTypes.REMOVE_TYPING_USER, payload: data });
    };

    const handleRoomUserJoined = (data) => {
      toast(`${data.username} joined ${data.roomId}`);
    };

    const handleRoomUserLeft = (data) => {
      toast(`${data.username} left ${data.roomId}`);
    };

    // Register event listeners
    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('rooms:list', handleRoomsList);
    socketClient.on('room:created', handleRoomCreated);
    socketClient.on('room:joined', handleRoomJoined);
    socketClient.on('messages:history', handleMessagesHistory);
    socketClient.on('message:new', handleNewMessage);
    socketClient.on('message:private', handlePrivateMessage);
    socketClient.on('message:reaction', handleMessageReaction);
    socketClient.on('users:online', handleOnlineUsers);
    socketClient.on('user:online', handleUserOnline);
    socketClient.on('user:offline', handleUserOffline);
    socketClient.on('user:status_change', handleUserStatusChange);
    socketClient.on('typing:start', handleTypingStart);
    socketClient.on('typing:stop', handleTypingStop);
    socketClient.on('room:user_joined', handleRoomUserJoined);
    socketClient.on('room:user_left', handleRoomUserLeft);

    return () => {
      // Cleanup event listeners
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('rooms:list', handleRoomsList);
      socketClient.off('room:created', handleRoomCreated);
      socketClient.off('room:joined', handleRoomJoined);
      socketClient.off('messages:history', handleMessagesHistory);
      socketClient.off('message:new', handleNewMessage);
      socketClient.off('message:private', handlePrivateMessage);
      socketClient.off('message:reaction', handleMessageReaction);
      socketClient.off('users:online', handleOnlineUsers);
      socketClient.off('user:online', handleUserOnline);
      socketClient.off('user:offline', handleUserOffline);
      socketClient.off('user:status_change', handleUserStatusChange);
      socketClient.off('typing:start', handleTypingStart);
      socketClient.off('typing:stop', handleTypingStop);
      socketClient.off('room:user_joined', handleRoomUserJoined);
      socketClient.off('room:user_left', handleRoomUserLeft);
    };
  }, [state.user, state.onlineUsers]);

  // Action creators
  const actions = {
    login: async (userData) => {
      try {
        console.log('🔑 Starting login process for:', userData);
        dispatch({ type: ActionTypes.SET_LOADING, payload: true });
        dispatch({ type: ActionTypes.SET_ERROR, payload: null });
        
        console.log('🔌 Attempting socket connection...');
        await socketClient.connect();
        console.log('✅ Socket connected, sending login...');
        
        // Update connection state immediately after socket connection
        dispatch({ type: ActionTypes.SET_CONNECTED, payload: true });
        
        const response = await socketClient.login(userData);
        console.log('✅ Login successful:', response);
        
        dispatch({ type: ActionTypes.SET_USER, payload: response.user });
        return response;
      } catch (error) {
        console.error('❌ Login failed:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: error.message });
        dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
        throw error;
      } finally {
        dispatch({ type: ActionTypes.SET_LOADING, payload: false });
      }
    },

    logout: () => {
      socketClient.disconnect();
      dispatch({ type: ActionTypes.SET_USER, payload: null });
      dispatch({ type: ActionTypes.SET_CONNECTED, payload: false });
      dispatch({ type: ActionTypes.SET_MESSAGES, payload: [] });
      dispatch({ type: ActionTypes.SET_CURRENT_ROOM, payload: null });
    },

    joinRoom: async (roomId) => {
      try {
        const response = await socketClient.joinRoom(roomId);
        return response;
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },

    createRoom: async (roomData) => {
      try {
        const response = await socketClient.createRoom(roomData);
        return response;
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },

    sendMessage: async (messageData) => {
      try {
        const response = await socketClient.sendMessage(messageData);
        return response;
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },

    reactToMessage: async (messageId, emoji) => {
      try {
        await socketClient.reactToMessage(messageId, emoji);
      } catch (error) {
        toast.error(error.message);
      }
    },

    searchMessages: async (query, roomId, userId) => {
      try {
        const response = await socketClient.searchMessages(query, roomId, userId);
        dispatch({ type: ActionTypes.SET_SEARCH_RESULTS, payload: response.messages });
        return response;
      } catch (error) {
        toast.error(error.message);
        throw error;
      }
    },

    clearSearchResults: () => {
      dispatch({ type: ActionTypes.CLEAR_SEARCH_RESULTS });
    },

    startTyping: (roomId) => {
      socketClient.startTyping(roomId);
    },

    stopTyping: (roomId) => {
      socketClient.stopTyping(roomId);
    },

    updateStatus: (status) => {
      socketClient.updateStatus(status);
    },

    removeNotification: (notificationId) => {
      dispatch({ type: ActionTypes.REMOVE_NOTIFICATION, payload: notificationId });
    }
  };

  return (
    <ChatContext.Provider value={{ state, actions }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
