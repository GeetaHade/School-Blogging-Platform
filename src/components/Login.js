import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Make sure axios is imported
import {
  Avatar,
  Button,
  CssBaseline,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Container,
  Box,
  Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const roles = ['Student', 'Faculty', 'Staff', 'Moderator', 'Administrator'];

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roles[0]);
  const navigate = useNavigate();
  const { login, user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      setUsername('');
      setPassword('');
      setRole(roles[0]);
    }
  }, [user]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
  
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
  
    // Find the user based on the username, password, and role
    const user = existingUsers.find(
      (u) =>
        u.username === username &&
        u.password === password &&
        u.role === role
    );
  
    if (user) {
      if (user.disabled) {
        alert('This account has been disabled by the administrator.');
        return;
      }
  
      try {
        const response = await axios.post('http://localhost:5001/login', {
          username,
          password,
          role,
        });
  
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          login(user.username, user.role);
          navigate('/');
        } else {
          alert('Token not received');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Error during login');
      }
    } else {
      alert('Invalid username, password, or role');
    }
  };
  
  const handleLogout = () => {
    logout(); // ✅ Clear context and localStorage
    setUsername('');
    setPassword('');
    setRole(roles[0]);
    navigate('/login');
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Paper elevation={6} sx={{ padding: 4, mt: 8, borderRadius: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Lock Icon */}
          <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          {/* Title */}
          <Typography component="h1" variant="h5">
            {user ? 'Welcome back!' : 'Sign In'}
          </Typography>

          {/* Form */}
          {user ? (
            <>
              <Typography sx={{ mt: 2 }}>
                You are logged in as <strong>{user.username}</strong> ({user.role})
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="error"
                onClick={handleLogout}
                sx={{ mt: 3 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              {/* Username Field */}
              <TextField
                margin="normal"
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="new-username"
                required
                autoFocus
              />

              {/* Password Field */}
              <TextField
                margin="normal"
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />

              {/* Role Field */}
              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  {roles.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign In
              </Button>

              {/* Sign-up Link */}
              <Typography align="center" sx={{ mt: 2 }}>
                Don’t have an account?{' '}
                <Link to="/signup" style={{ textDecoration: 'none', color: '#1976d2' }}>
                  Sign up here
                </Link>
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
