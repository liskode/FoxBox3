import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FoxBox
        </Typography>
        <Box>
          <Button color="inherit" onClick={() => navigate('/')}>
            Study
          </Button>
          {/* Add more navigation buttons as needed */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader; 