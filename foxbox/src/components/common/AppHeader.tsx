import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <SchoolIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FoxBox Leitner
        </Typography>
        <Box>
          <Tooltip title="Review flashcards due today">
            <Button 
              color="inherit" 
              onClick={() => navigate('/')}
              startIcon={<MenuBookIcon />}
            >
              Study
            </Button>
          </Tooltip>
          {/* Add more navigation buttons as needed */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 