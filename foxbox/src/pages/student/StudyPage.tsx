import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import FlashCardDeck from '../../components/common/FlashCardDeck';

const StudyPage: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          FoxBox Study Session
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
          Review your flashcards and mark them as correct or incorrect.
        </Typography>
        <FlashCardDeck />
      </Box>
    </Container>
  );
};

export default StudyPage; 