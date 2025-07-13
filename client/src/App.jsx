import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import Notifications from './components/Notifications';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </Router>
      <Toaster position="bottom-center" reverseOrder={false} />
      <Notifications />
    </ChatProvider>
  );
}

export default App;

