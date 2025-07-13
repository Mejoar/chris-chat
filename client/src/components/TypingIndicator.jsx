import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useChat } from '../context/ChatContext';

const typing = keyframes`
  0%, 60%, 100% {
    transform: initial;
  }
  
  30% {
    transform: translateY(-10px);
  }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
  font-style: italic;
  min-height: 1.5rem;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 0.2rem;
  align-items: center;
`;

const Dot = styled.div`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #6b7280;
  animation: ${typing} 1.4s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

const TypingIndicator = () => {
  const { state } = useChat();

  // Filter typing users for current room
  const typingUsers = state.typingUsers.filter(
    user => user.roomId === state.currentRoom?.id && user.userId !== state.user?.id
  );

  if (typingUsers.length === 0) {
    return <Container />;
  }

  const renderTypingMessage = () => {
    const usernames = typingUsers.map(user => user.username);
    
    if (usernames.length === 1) {
      return `${usernames[0]} is typing`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing`;
    } else {
      return `${usernames.slice(0, -1).join(', ')} and ${usernames[usernames.length - 1]} are typing`;
    }
  };

  return (
    <Container>
      <span>{renderTypingMessage()}</span>
      <TypingDots>
        <Dot delay={0} />
        <Dot delay={0.2} />
        <Dot delay={0.4} />
      </TypingDots>
    </Container>
  );
};

export default TypingIndicator;
