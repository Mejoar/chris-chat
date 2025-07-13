import React, { useEffect } from 'react';
import { useChat } from '../context/ChatContext';

const Notifications = () => {
  const { state } = useChat();

  useEffect(() => {
    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return null; // This component doesn't render anything
};

export default Notifications;
