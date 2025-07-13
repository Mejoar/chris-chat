import React, { useState } from 'react';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { FiX } from 'react-icons/fi';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 80%;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  margin: 0;
  color: #1f2937;
  font-size: 1.2rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  border-radius: 0.25rem;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.9rem;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s;

  ${props => props.variant === 'primary' ? `
    background-color: #4f46e5;
    color: white;
    border-color: #4f46e5;

    &:hover:not(:disabled) {
      background-color: #4338ca;
      border-color: #4338ca;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  ` : `
    background-color: white;
    color: #374151;
    border-color: #d1d5db;

    &:hover {
      background-color: #f9fafb;
    }
  `}
`;

const CreateRoomModal = ({ isOpen, onClose }) => {
  const { actions } = useChat();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '💬'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await actions.createRoom(formData);
      setFormData({ name: '', description: '', icon: '💬' });
      onClose();
    } catch (error) {
      console.error('Create room error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <Title>Create New Room</Title>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Room Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter room name"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="icon">Icon</Label>
            <Input
              id="icon"
              name="icon"
              type="text"
              value={formData.icon}
              onChange={handleInputChange}
              placeholder="Enter an emoji"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter room description (optional)"
            />
          </FormGroup>

          <ButtonGroup>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={!formData.name.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default CreateRoomModal;
