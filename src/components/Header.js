import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';
import RecommendationPopup from './RecommendationPopup';


function Header(props) {
  const { sections, title } = props;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [manageMode, setManageMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [recPopupOpen, setRecPopupOpen] = useState(false);


  const open = Boolean(anchorEl);
  const userList = JSON.parse(localStorage.getItem('users')) || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleManageAccounts = () => {
    setManageMode(!manageMode);
  };

  const handleDisableToggle = () => {
    const users = userList.map((u) =>
      u.username === selectedUser ? { ...u, disabled: !u.disabled } : u
    );
    localStorage.setItem('users', JSON.stringify(users));
    alert(`Account ${selectedUser} has been ${users.find(u => u.username === selectedUser).disabled ? 'disabled' : 'enabled'}.`);
    setSelectedUser('');
    setManageMode(false);
  };

  return (
    <>
      {/* Top Toolbar */}
      <Toolbar
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          justifyContent: 'space-between',
          backgroundColor: '#f5f5f5',
          padding: '10px',
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          noWrap
          sx={{ flex: 1, fontWeight: 'bold', color: '#333' }}
        >
          {title}
        </Typography>

        {user ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle1" color="text.secondary">
              {user.username} ({user.role})
            </Typography>

            <IconButton
              onClick={handleMenuOpen}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            >
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { navigate('/create-post'); handleMenuClose(); }}>
                Create Post
              </MenuItem>
              <MenuItem onClick={() => { navigate('/chatbot'); handleMenuClose(); }}>
                AI Assistant
              </MenuItem>
              <MenuItem onClick={() => { setRecPopupOpen(true); handleMenuClose(); }}>
  Recommended For You
</MenuItem>


              {user.role === 'Administrator' && (
                <MenuItem onClick={() => { handleManageAccounts(); handleMenuClose(); }}>
                  Manage Accounts
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </Menu>
          </Stack>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Login
          </Button>
        )}
      </Toolbar>
      <RecommendationPopup open={recPopupOpen} onClose={() => setRecPopupOpen(false)} />


      {/* Dropdown to manage users (only visible when toggled) */}
      {user?.role === 'Administrator' && manageMode && (
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mt: 1 }}>
          <Select
            size="small"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            displayEmpty
            sx={{ minWidth: 240, mx: 2 }}
          >
            <MenuItem value="" disabled>
              Select user to manage
            </MenuItem>
            {userList.map((u) => (
              <MenuItem key={u.username} value={u.username}>
                {u.username} ({u.role}) [{u.disabled ? 'Disabled' : 'Active'}]
              </MenuItem>
            ))}
          </Select>
          {selectedUser && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleDisableToggle}
              sx={{ textTransform: 'none' }}
            >
              Toggle Status
            </Button>
          )}
        </Box>
      )}

      {/* Navigation Links */}
      <Toolbar
        component="nav"
        variant="dense"
        sx={{
          justifyContent: 'center',
          overflowX: 'auto',
          backgroundColor: '#fafafa',
          paddingY: 1,
        }}
      >
        {sections.map((section) => (
          <RouterLink
            key={section.title}
            to={section.url}
            style={{
              textDecoration: 'none',
              color: '#555',
              padding: '10px 16px',
              fontWeight: '500',
            }}
          >
            {section.title}
          </RouterLink>
        ))}
      </Toolbar>
    </>
  );
}

Header.propTypes = {
  sections: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ).isRequired,
  title: PropTypes.string.isRequired,
};

export default Header;
