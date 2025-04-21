import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Tooltip, Chip, Stack, Container } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAppContext } from '../../context/AppContext';
import logo from '../../fox-logo.png';

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { classes, studentProgress } = useAppContext();

  // Calculate summary stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((sum, cls) => sum + cls.students.length, 0);
  
  // Calculate avg cards per student
  const studentsWithCards = Object.keys(studentProgress).length;
  const totalCards = Object.values(studentProgress)
    .reduce((sum, student) => sum + Object.keys(student.progress || {}).length, 0);
  const avgCardsPerStudent = studentsWithCards > 0 
    ? (totalCards / studentsWithCards).toFixed(1) 
    : '0';
  
  // Calculate total study sessions (total of all usageDates across students)
  const totalStudySessions = Object.values(studentProgress)
    .reduce((sum, student) => sum + (student.usageDates?.length || 0), 0);

  return (
    <>
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
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Summary Stats Bar */}
      <Box 
        sx={{ 
          backgroundColor: 'background.paper', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
          py: 0.5
        }}
      >
        <Container maxWidth="lg">
          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="center"
            sx={{ 
              overflowX: 'auto', 
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none'
            }}
          >
            <Chip
              icon={<SchoolIcon fontSize="small" />}
              label={`${totalClasses} Classes`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<PeopleIcon fontSize="small" />}
              label={`${totalStudents} Students`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<MenuBookIcon fontSize="small" />}
              label={`${avgCardsPerStudent} Avg Cards/Student`}
              variant="outlined"
              size="small"
            />
            <Chip
              icon={<CalendarMonthIcon fontSize="small" />}
              label={`${totalStudySessions} Study Sessions`}
              variant="outlined"
              size="small"
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export default AppHeader; 