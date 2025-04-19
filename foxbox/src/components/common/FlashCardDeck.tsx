import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import FlashCard from './FlashCard';
import { getFlashcards, updateFlashcardAfterReview, getDueFlashcards } from '../../services';
import { FlashCard as FlashCardType } from '../../types/FlashCard';
import LeitnerBoxSummary from './LeitnerBoxSummary';

const FlashCardDeck: React.FC = () => {
  const [flashcards, setFlashcards] = useState<FlashCardType[]>([]);
  const [dueCards, setDueCards] = useState<FlashCardType[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deckCompleted, setDeckCompleted] = useState(false);

  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setLoading(true);
        const cards = await getFlashcards();
        setFlashcards(cards);
        
        // Filter to get only cards due for review today
        const due = getDueFlashcards(cards);
        setDueCards(due);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading flashcards:', error);
        setLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  useEffect(() => {
    // Check if there are any cards due for review
    if (dueCards.length === 0 && flashcards.length > 0) {
      setDeckCompleted(true);
    } else if (currentCardIndex >= dueCards.length && dueCards.length > 0) {
      // We've gone through all due cards
      setDeckCompleted(true);
    }
  }, [currentCardIndex, dueCards, flashcards.length]);

  const handleAnswer = (cardId: string, isCorrect: boolean) => {
    // Find the card in the flashcards array
    const cardIndex = flashcards.findIndex(card => card.id === cardId);
    if (cardIndex === -1) return;
    
    const card = flashcards[cardIndex];
    
    // Update the card using the Leitner system rules
    const updatedCard = updateFlashcardAfterReview(card, isCorrect);
    
    // Update the flashcards array
    const updatedFlashcards = [...flashcards];
    updatedFlashcards[cardIndex] = updatedCard;
    setFlashcards(updatedFlashcards);
    
    // Remove the card from dueCards if it was answered correctly
    // If answered incorrectly, it stays in box 1 and will be due again tomorrow
    if (isCorrect) {
      setDueCards(prevDueCards => 
        prevDueCards.filter(c => c.id !== cardId)
      );
    } else {
      // Update the card in the dueCards array too
      setDueCards(prevDueCards => {
        const dueCardIndex = prevDueCards.findIndex(c => c.id === cardId);
        if (dueCardIndex === -1) return prevDueCards;
        
        const updatedDueCards = [...prevDueCards];
        updatedDueCards[dueCardIndex] = updatedCard;
        
        // Move this card to the end of the queue
        const card = updatedDueCards.splice(dueCardIndex, 1)[0];
        updatedDueCards.push(card);
        
        return updatedDueCards;
      });
    }
    
    // Move to the next card if we're not at the end
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Check if we have any cards left after filtering
      const remainingDueCards = dueCards.filter(c => c.id !== cardId);
      if (remainingDueCards.length === 0) {
        setDeckCompleted(true);
      }
    }
  };

  const resetDeck = () => {
    // Reset all cards to box 1
    const resetCards = flashcards.map(card => ({
      ...card,
      box: 1,
      status: 'pending' as const,
      lastReviewed: null,
      nextReviewDate: null
    }));
    
    setFlashcards(resetCards);
    setDueCards(resetCards);
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
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom align="center">
          Great job! You've completed all flashcards due for review today.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetDeck}
            sx={{ mx: 1 }}
          >
            Reset All Cards
          </Button>
        </Box>
        
        {/* Display the Leitner box summary */}
        <LeitnerBoxSummary flashcards={flashcards} />
      </Box>
    );
  }

  const currentCard = dueCards[currentCardIndex];

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
        Flashcards: {dueCards.length - currentCardIndex} remaining today
      </Typography>
      
      <FlashCard
        questionImageSrc={currentCard.questionImageSrc}
        answerImageSrc={currentCard.answerImageSrc}
        cardId={currentCard.id}
        onAnswer={handleAnswer}
      />
      
      {/* Display the Leitner box summary */}
      <LeitnerBoxSummary flashcards={flashcards} />
      
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Current card is in Box {currentCard.box}
      </Typography>
    </Box>
  );
};

export default FlashCardDeck; 