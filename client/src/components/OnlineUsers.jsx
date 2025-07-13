import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 200px;
  overflow-y: auto;
`;

const UserItem = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #4b5563;

  &:hover {
    background-color: #4b5563;
  }
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
  margin-right: 0.5rem;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-size: 0.9rem;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.status) {
      case 'online': return '#10b981';
      case 'away': return '#f59e0b';
      case 'busy': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  margin-left: 0.5rem;
`;

const OnlineUsers = () => {
  const { state } = useChat();

  const handleUserClick = (userId) => {
    // TODO: Implement private messaging
    console.log('Start private chat with:', userId);
  };

  return (
    <Container>
      {state.onlineUsers.map((user) => (
        <UserItem
          key={user.id}
          onClick={() => handleUserClick(user.id)}
        >
          <Avatar>
            {user.username.slice(0, 2).toUpperCase()}
          </Avatar>
          <UserInfo>
            <Username>{user.username}</Username>
          </UserInfo>
          <StatusDot status={user.status} />
        </UserItem>
      ))}
    </Container>
  );
};

export default OnlineUsers;
