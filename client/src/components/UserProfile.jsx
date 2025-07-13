import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { FiLogOut, FiUser, FiCircle } from 'react-icons/fi';

const Container = styled.div`
  padding: 1rem;
  background-color: #1f2937;
  border-top: 1px solid #4b5563;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-weight: 500;
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: #9ca3af;
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
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #374151;
    color: white;
  }
`;

const UserProfile = () => {
  const { state, actions } = useChat();

  const handleLogout = () => {
    actions.logout();
  };

  if (!state.user) {
    return null;
  }

  return (
    <Container>
      <UserInfo>
        <Avatar>
          {state.user.username.slice(0, 2).toUpperCase()}
        </Avatar>
        <UserDetails>
          <Username>{state.user.username}</Username>
          <Status>
            <StatusDot status={state.user.status} />
            {state.user.status}
          </Status>
        </UserDetails>
        <LogoutButton onClick={handleLogout}>
          <FiLogOut />
        </LogoutButton>
      </UserInfo>
    </Container>
  );
};

export default UserProfile;
