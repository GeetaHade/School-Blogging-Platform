import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(roles[0]);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    // ✅ Get existing users from local storage
    const existingUsers = JSON.parse(localStorage.getItem('users')) || [];

    // ✅ Check if username already exists
    if (existingUsers.find((user) => user.username === username)) {
      alert('❌ Username already exists');
      return;
    }

    // ✅ Add new user
    const newUser = { username, password, role };
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    alert('✅ Signup successful! You can now login.');
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
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>

          {/* Title */}
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>

          {/* Form */}
          <Box component="form" onSubmit={handleSignup} sx={{ mt: 1 }}>
            {/* Username Field */}
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              Sign Up
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Signup;
