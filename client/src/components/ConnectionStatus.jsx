import React from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { FiWifi, FiWifiOff, FiLoader } from 'react-icons/fi';

const Container = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case 'connected': return '#10b981';
      case 'connecting': return '#f59e0b';
      case 'disconnected': return '#ef4444';
      default: return '#6b7280';
    }
  }};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
`;

const Icon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    animation: ${props => props.spinning ? 'spin 1s linear infinite' : 'none'};
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ConnectionStatus = () => {
  const { state } = useChat();

  if (!state.user) {
    return null;
  }

  const getStatusInfo = () => {
    if (state.isConnected) {
      return {
        status: 'connected',
        icon: <FiWifi />,
        text: 'Connected',
        spinning: false
      };
    } else if (state.isLoading) {
      return {
        status: 'connecting',
        icon: <FiLoader />,
        text: 'Connecting...',
        spinning: true
      };
    } else {
      return {
        status: 'disconnected',
        icon: <FiWifiOff />,
        text: 'Disconnected',
        spinning: false
      };
    }
  };

  const { status, icon, text, spinning } = getStatusInfo();

  return (
    <Container status={status}>
      <Icon spinning={spinning}>
        {icon}
      </Icon>
      {text}
    </Container>
  );
};

export default ConnectionStatus;
