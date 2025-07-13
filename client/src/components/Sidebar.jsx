import React, { useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import UserProfile from './UserProfile';
import RoomList from './RoomList';
import OnlineUsers from './OnlineUsers';
import CreateRoomModal from './CreateRoomModal';
import { FiPlus, FiSearch } from 'react-icons/fi';

const Container = styled.div`
  width: 300px;
  background-color: #374151;
  color: white;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 1rem;
  background-color: #1f2937;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 1.2rem;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #4b5563;
  }
`;

const SearchContainer = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #4b5563;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #4b5563;
  border-radius: 0.375rem;
  background-color: #1f2937;
  color: white;
  font-size: 0.9rem;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Section = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #4b5563;
`;

const SectionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #9ca3af;
  text-transform: uppercase;
`;

const Sidebar = () => {
  const { state, actions } = useChat();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      try {
        await actions.searchMessages(query, state.currentRoom?.id);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      actions.clearSearchResults();
    }
  };

  return (
    <Container>
      <Header>
        <Title>Chat Rooms</Title>
        <AddButton onClick={() => setShowCreateRoom(true)}>
          <FiPlus />
        </AddButton>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Search messages..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </SearchContainer>

      <ContentArea>
        <Section>
          <SectionTitle>Rooms</SectionTitle>
          <RoomList />
        </Section>

        <Section>
          <SectionTitle>Online Users ({state.onlineUsers.length})</SectionTitle>
          <OnlineUsers />
        </Section>
      </ContentArea>

      <UserProfile />

      {showCreateRoom && (
        <CreateRoomModal 
          isOpen={showCreateRoom} 
          onClose={() => setShowCreateRoom(false)} 
        />
      )}
    </Container>
  );
};

export default Sidebar;
