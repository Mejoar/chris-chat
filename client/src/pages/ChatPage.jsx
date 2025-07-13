import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import ConnectionStatus from '../components/ConnectionStatus';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f3f4f6;
`;

const ChatPage = () => {
  const navigate = useNavigate();
  const { state } = useChat();

  useEffect(() => {
    if (!state.user) {
      navigate('/');
    }
  }, [state.user, navigate]);

  if (!state.user) {
    return <div>Loading...</div>;
  }

  return (
    <Container>
      <ConnectionStatus />
      <Sidebar />
      <ChatArea />
    </Container>
  );
};

export default ChatPage;
