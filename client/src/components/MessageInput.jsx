import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { FiSend, FiSmile, FiPaperclip } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: white;
`;

const InputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 40px;
  max-height: 120px;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.375rem;
  resize: none;
  font-size: 0.9rem;
  font-family: inherit;
  line-height: 1.4;
  background-color: white;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    background-color: white;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #f3f4f6;
    color: #374151;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled(ActionButton)`
  background-color: #4f46e5;
  color: white;

  &:hover:not(:disabled) {
    background-color: #4338ca;
  }
`;

const DebugInfo = styled.div`
  font-size: 0.7rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
  padding: 0.25rem;
  background-color: #f9fafb;
  border-radius: 0.25rem;
`;

const MessageInput = () => {
  const { state, actions } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Debug info
  const isInputDisabled = !state.currentRoom || !state.isConnected;
  const debugInfo = {
    connected: state.isConnected,
    currentRoom: state.currentRoom?.name || 'None',
    user: state.user?.username || 'Not logged in',
    disabled: isInputDisabled
  };

  const handleTyping = useCallback(() => {
    if (!isTyping && state.currentRoom) {
      setIsTyping(true);
      actions.startTyping(state.currentRoom.id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && state.currentRoom) {
        setIsTyping(false);
        actions.stopTyping(state.currentRoom.id);
      }
    }, 1000);
  }, [isTyping, state.currentRoom, actions]);

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    handleTyping();
    
    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !state.currentRoom) return;

    try {
      await actions.sendMessage({
        content: message.trim(),
        roomId: state.currentRoom.id,
        type: 'text'
      });

      setMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        actions.stopTyping(state.currentRoom.id);
      }

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div>
      <DebugInfo>
        🔍 Debug: Connected: {debugInfo.connected ? '✅' : '❌'} | Room: {debugInfo.currentRoom} | User: {debugInfo.user} | Input Disabled: {debugInfo.disabled ? '✅' : '❌'}
      </DebugInfo>
      <Container>
        <ActionButton>
          <FiPaperclip />
        </ActionButton>
        
        <InputContainer>
          <TextArea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${state.currentRoom?.name || 'room'}...`}
            disabled={isInputDisabled}
          />
        </InputContainer>

        <ActionButton>
          <FiSmile />
        </ActionButton>

        <SendButton 
          onClick={handleSendMessage}
          disabled={!message.trim() || isInputDisabled}
        >
          <FiSend />
        </SendButton>
      </Container>
    </div>
  );
};

export default MessageInput;
