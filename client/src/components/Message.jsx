import React, { useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { FiMoreHorizontal, FiSmile } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  position: relative;

  &:hover {
    background-color: #f3f4f6;
  }

  &:hover .message-actions {
    opacity: 1;
  }
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
  flex-shrink: 0;
`;

const MessageContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const Username = styled.span`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
`;

const Timestamp = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
`;

const MessageText = styled.div`
  color: #374151;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
`;

const MessageActions = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  gap: 0.25rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
`;

const Reactions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
`;

const ReactionButton = styled.button`
  background-color: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background-color: #e5e7eb;
  }

  &.reacted {
    background-color: #dbeafe;
    border-color: #3b82f6;
  }
`;

const EmojiPickerContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
`;

const ReadReceipts = styled.div`
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const Message = ({ message }) => {
  const { state, actions } = useChat();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReaction = async (emoji) => {
    try {
      await actions.reactToMessage(message.id, emoji);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Reaction error:', error);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    handleReaction(emojiObject.emoji);
  };

  const isOwnMessage = message.senderId === state.user?.id;

  return (
    <Container>
      <Avatar>
        {message.senderUsername.slice(0, 2).toUpperCase()}
      </Avatar>
      
      <MessageContent>
        <MessageHeader>
          <Username>{message.senderUsername}</Username>
          <Timestamp>
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </Timestamp>
          {message.edited && (
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>(edited)</span>
          )}
        </MessageHeader>
        
        <MessageText>{message.content}</MessageText>
        
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <Reactions>
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <ReactionButton
                key={emoji}
                className={users.includes(state.user?.id) ? 'reacted' : ''}
                onClick={() => handleReaction(emoji)}
              >
                {emoji} {users.length}
              </ReactionButton>
            ))}
          </Reactions>
        )}
        
        {message.readBy && message.readBy.length > 0 && (
          <ReadReceipts>
            Read by {message.readBy.length} user{message.readBy.length !== 1 ? 's' : ''}
          </ReadReceipts>
        )}
      </MessageContent>
      
      <MessageActions className="message-actions">
        <ActionButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <FiSmile />
        </ActionButton>
        <ActionButton>
          <FiMoreHorizontal />
        </ActionButton>
        
        {showEmojiPicker && (
          <EmojiPickerContainer>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={300}
              height={400}
            />
          </EmojiPickerContainer>
        )}
      </MessageActions>
    </Container>
  );
};

export default Message;
