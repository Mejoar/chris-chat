import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { FiHash } from 'react-icons/fi';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: white;
  height: 100vh;
`;

const Header = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoomIcon = styled.div`
  color: #6b7280;
  font-size: 1.2rem;
`;

const RoomName = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
`;

const RoomDescription = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  margin-left: auto;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: #f9fafb;
`;

const InputContainer = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
`;

const NoRoomSelected = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1.1rem;
`;

const ChatArea = () => {
  const { state } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  if (!state.currentRoom) {
    return (
      <Container>
        <NoRoomSelected>
          Select a room to start chatting
        </NoRoomSelected>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <RoomIcon>
          {state.currentRoom.icon || <FiHash />}
        </RoomIcon>
        <RoomName>{state.currentRoom.name}</RoomName>
        <RoomDescription>{state.currentRoom.description}</RoomDescription>
      </Header>

      <MessagesContainer>
        <MessageList />
        <TypingIndicator />
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <MessageInput />
      </InputContainer>
    </Container>
  );
};

export default ChatArea;
