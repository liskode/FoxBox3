import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import FlashCard from './FlashCard';
import { getFlashcards } from '../../services/flashcardService';
import { FlashCard as FlashCardType } from '../../types/FlashCard';

const FlashCardDeck: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashCardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deckCompleted, setDeckCompleted] = useState(false);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setLoading(true);
        const cards = await getFlashcards();
        setFlashcards(cards);
        setLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  useEffect(() => {
    // Check if there are any pending cards left
    const pendingCards = flashcards.filter(card => card.status === 'pending');
    
    if (pendingCards.length === 0 && flashcards.length > 0) {
      setDeckCompleted(true);
    } else if (currentCardIndex >= flashcards.length && flashcards.length > 0) {
      // Reset to first pending card if we've gone through all cards
      const nextPendingIndex = flashcards.findIndex(card => card.status === 'pending');
      setCurrentCardIndex(nextPendingIndex !== -1 ? nextPendingIndex : 0);
    }
  }, [currentCardIndex, flashcards]);

  const handleAnswer = (cardId: string, isCorrect: boolean) => {
    setFlashcards(prevCards => 
      prevCards.map(card => 
        card.id === cardId 
          ? { ...card, status: isCorrect ? 'ok' : 'ko' } 
          : card
      )
    );
    
    // Move to the next card
    const pendingCards = flashcards.filter(card => 
      card.status === 'pending' && card.id !== cardId
    );
    
    if (pendingCards.length > 0) {
      const nextCardIndex = flashcards.findIndex(card => 
        card.status === 'pending' && card.id !== cardId
      );
      setCurrentCardIndex(nextCardIndex !== -1 ? nextCardIndex : currentCardIndex + 1);
    } else {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const resetDeck = () => {
    setFlashcards(prevCards => prevCards.map(card => ({ ...card, status: 'pending' })));
    setCurrentCardIndex(0);
    setDeckCompleted(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (flashcards.length === 0) {
    return (
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        No flashcards available.
      </Typography>
    );
  }

  if (deckCompleted) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Great job! You've completed all flashcards.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={resetDeck}
          sx={{ mt: 2 }}
        >
          Reset Deck
        </Button>
      </Box>
    );
  }

  const pendingCards = flashcards.filter(card => card.status === 'pending');
  const currentCard = flashcards[currentCardIndex] || pendingCards[0];

  if (!currentCard) {
    return (
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        No active flashcards to display.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" align="center" gutterBottom>
        Flashcards: {pendingCards.length} remaining
      </Typography>
      <FlashCard
        questionImageSrc={currentCard.questionImageSrc}
        answerImageSrc={currentCard.answerImageSrc}
        cardId={currentCard.id}
        onAnswer={handleAnswer}
      />
    </Box>
  );
};

export default FlashCardDeck; 