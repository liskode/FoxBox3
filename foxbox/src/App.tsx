import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentStudyPage from './pages/student/StudentStudyPage'; // Import the new student page
import TeacherDashboard from './pages/teacher/TeacherDashboard'; // Import Teacher Dashboard
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppHeader from './components/common/AppHeader';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    mode: 'dark', // Enable dark mode
    primary: {
      main: '#ffffff', // White color instead of orange
    },
    secondary: {
      main: '#455a64',
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1e1e1e',   // Slightly lighter dark for paper elements
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <AppHeader />
          <Routes>
            {/* Redirect base path to teacher dashboard for now */}
            <Route path="/" element={<Navigate to="/teacher" replace />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            {/* Route for the student-specific study page */}
            <Route path="/student/:studentId/study" element={<StudentStudyPage />} />
            {/* Add other routes as needed */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
