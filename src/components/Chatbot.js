import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Paper, Typography, Stack, Container } from '@mui/material';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get user's location once when component mounts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ latitude, longitude });
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocation(null);
      }
    );
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !location) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/chatbot/recommend', {
        message: input,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const aiReply = response.data.reply;
      setMessages([...newMessages, { sender: 'bot', text: aiReply }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'bot', text: 'Error getting reply. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to right, #a8edea, #fed6e3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, backgroundColor: '#ffffffcc' }}>
          <Typography variant="h4" align="center" fontWeight="bold" color="primary" gutterBottom>
            AI Chat Assistant 🤖
          </Typography>

          <Box
            sx={{
              minHeight: 300,
              maxHeight: 400,
              overflowY: 'auto',
              mb: 3,
              p: 2,
              backgroundColor: '#f9f9f9',
              borderRadius: 2,
              border: '1px solid #ddd',
              boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
            }}
          >
            {messages.map((msg, i) => (
              <Typography
                key={i}
                sx={{
                  textAlign: msg.sender === 'user' ? 'right' : 'left',
                  mb: 1,
                  fontWeight: 500,
                  color: msg.sender === 'user' ? '#1976d2' : '#444'
                }}
              >
                <strong>{msg.sender === 'user' ? 'You' : 'Bot'}:</strong> {msg.text}
              </Typography>
            ))}
          </Box>

          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              label="Type your question..."
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <Button variant="contained" onClick={handleSend} disabled={loading}>
              Send
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default Chatbot;
