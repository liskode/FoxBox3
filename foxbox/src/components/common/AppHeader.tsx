import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Tooltip } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
// import MenuBookIcon from '@mui/icons-material/MenuBook'; // Removed unused import
import logo from '../../fox-logo.png';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" elevation={4} sx={{ backgroundColor: 'background.paper' }}>
      <Toolbar>
        <Link to="/teacher" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="FoxBox Logo" style={{ height: '60px', marginRight: '15px' }} />
          <Typography variant="h6" component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
            FoxBox Leitner
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Box>
          <Tooltip title="Teacher Dashboard">
            <Button
              color="inherit"
              onClick={() => navigate('/teacher')}
              startIcon={<SchoolIcon />}
            >
              Dashboard
            </Button>
          </Tooltip>
          {/* <Tooltip title="Review flashcards due today">
            <Button
              color="inherit"
              // TODO: Make study button navigate to a student selector or the current student's view
              onClick={() => navigate('/')} // Placeholder navigation
              startIcon={<MenuBookIcon />}
            >
              Study
            </Button>
          </Tooltip> */}
          {/* Add more navigation buttons as needed */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 