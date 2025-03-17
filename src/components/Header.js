import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Stack from '@mui/material/Stack';

function Header(props) {
  const { sections, title } = props;
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          color="inherit"
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
            <Button
              onClick={handleLogout}
              variant="outlined"
              color="secondary"
              sx={{ textTransform: 'none' }}
            >
              Logout
            </Button>
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
