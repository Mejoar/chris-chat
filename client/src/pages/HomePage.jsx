import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useChat } from '../context/ChatContext';
import { FiMessageCircle, FiUser, FiMail } from 'react-icons/fi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  right: 1rem;
  color: #9ca3af;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Features = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const Feature = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const HomePage = () => {
  const navigate = useNavigate();
  const { actions, state } = useChat();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      await actions.login({ 
        username: username.trim(), 
        email: email.trim() || `${username.trim()}@chrischat.com` 
      });
      navigate('/chat');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Logo>💬</Logo>
        <Title>Chris Chat</Title>
        <Subtitle>Connect with friends in real-time</Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
            <InputIcon>
              <FiUser />
            </InputIcon>
          </InputGroup>
          
          <InputGroup>
            <Input
              type="email"
              placeholder="Enter your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <InputIcon>
              <FiMail />
            </InputIcon>
          </InputGroup>
          
          <LoginButton type="submit" disabled={isLoading || !username.trim()}>
            {isLoading && <LoadingSpinner />}
            {isLoading ? 'Connecting...' : 'Join Chat'}
          </LoginButton>
        </Form>
        
        <Features>
          <Feature>
            <FiMessageCircle size={20} />
            <div>Real-time</div>
          </Feature>
          <Feature>
            <div>💬</div>
            <div>Multi-room</div>
          </Feature>
          <Feature>
            <div>🔔</div>
            <div>Notifications</div>
          </Feature>
        </Features>
      </Card>
    </Container>
  );
};

export default HomePage;

