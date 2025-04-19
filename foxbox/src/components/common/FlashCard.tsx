import React, { useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

interface FlashCardProps {
  questionImageSrc: string;
  answerImageSrc: string;
  cardId: string;
  onAnswer: (cardId: string, isCorrect: boolean) => void;
}

const FlashCard: React.FC<FlashCardProps> = ({ 
  questionImageSrc, 
  answerImageSrc, 
  cardId,
  onAnswer 
}) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleAnswer = (isCorrect: boolean) => {
    onAnswer(cardId, isCorrect);
    setFlipped(false);
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 500, 
        margin: '0 auto', 
        cursor: 'pointer',
        height: 400,
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={!flipped ? handleFlip : undefined}
    >
      <CardMedia
        component="img"
        sx={{ 
          height: 300,
          objectFit: 'contain',
          padding: 2,
          backgroundColor: '#f5f5f5'
        }}
        image={flipped ? answerImageSrc : questionImageSrc}
        alt={flipped ? "Answer" : "Question"}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        {!flipped ? (
          <Typography variant="body1" color="text.secondary" textAlign="center">
            Click to see the answer
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="contained" 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(false);
              }}
              sx={{ flexGrow: 1, mr: 1 }}
            >
              Incorrect
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              onClick={(e) => {
                e.stopPropagation();
                handleAnswer(true);
              }}
              sx={{ flexGrow: 1, ml: 1 }}
            >
              Correct
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashCard; 