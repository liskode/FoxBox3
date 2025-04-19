import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudyPage from './pages/student/StudyPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppHeader from './components/common/AppHeader';
import './App.css';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6f00', // Fox-like orange color
    },
    secondary: {
      main: '#455a64',
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
            <Route path="/" element={<StudyPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
