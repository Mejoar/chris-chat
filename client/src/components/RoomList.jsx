import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const RoomItem = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #4b5563;

  &:hover {
    background-color: #4b5563;
  }

  &.active {
    background-color: #4f46e5;
  }
`;

const RoomIcon = styled.span`
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RoomList = () => {
  const { state, actions } = useChat();

  const handleRoomClick = async (roomId) => {
    if (state.currentRoom?.id === roomId) return;
    try {
      await actions.joinRoom(roomId);
    } catch (error) {
      console.error('Room join error:', error);
    }
  };

  return (
    <Container>
      {state.rooms.map((room) => (
        <RoomItem
          key={room.id}
          className={state.currentRoom?.id === room.id ? 'active' : ''}
          onClick={() => handleRoomClick(room.id)}
        >
          <RoomIcon>{room.icon}</RoomIcon>
          {room.name}
        </RoomItem>
      ))}
    </Container>
  );
};

export default RoomList;

