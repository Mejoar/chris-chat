import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import Message from './Message';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MessageList = () => {
  const { state } = useChat();

  return (
    <Container>
      {state.messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </Container>
  );
};

export default MessageList;
