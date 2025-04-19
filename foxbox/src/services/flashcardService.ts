import axios from 'axios';
import { FlashCard } from '../types/FlashCard';

// Calculate the next review date based on the box number
const calculateNextReviewDate = (box: number): Date => {
  const today = new Date();
  const nextDate = new Date(today);
  
  // Leitner system scheduling:
  // Box 1: review every day
  // Box 2: review every 2 days
  // Box 3: review every 4 days
  // Box 4: review every 7 days
  // Box 5: review every 14 days
  // Box 6: review every 30 days
  // Box 7: review every 60 days
  
  switch (box) {
    case 1: 
      nextDate.setDate(today.getDate() + 1); 
      break;
    case 2: 
      nextDate.setDate(today.getDate() + 2); 
      break;
    case 3: 
      nextDate.setDate(today.getDate() + 4); 
      break;
    case 4: 
      nextDate.setDate(today.getDate() + 7); 
      break;
    case 5: 
      nextDate.setDate(today.getDate() + 14); 
      break;
    case 6: 
      nextDate.setDate(today.getDate() + 30); 
      break;
    case 7: 
      nextDate.setDate(today.getDate() + 60); 
      break;
    default: 
      nextDate.setDate(today.getDate() + 1);
  }
  
  return nextDate;
};

// In a production environment, this would be fetched from an API
// For now, we'll use a mock implementation that simulates loading flashcards
export const getFlashcards = async (): Promise<FlashCard[]> => {
  // This is a placeholder for fetching from a real API
  // In a complete implementation, we would call an API endpoint
  
  // For development, we'll create mock flashcards based on the files we saw
  // In the src/public folder you would typically store these images
  const mockFlashcards: FlashCard[] = [
    {
      id: '421FC_01',
      questionImageSrc: '/flashcards/421FC_01Q.png',
      answerImageSrc: '/flashcards/421FC_01R.png',
      status: 'pending',
      box: 1,
      lastReviewed: null,
      nextReviewDate: null
    },
    {
      id: '421FC_02',
      questionImageSrc: '/flashcards/421FC_02Q.png',
      answerImageSrc: '/flashcards/421FC_02R.png',
      status: 'pending',
      box: 1,
      lastReviewed: null,
      nextReviewDate: null
    },
    {
      id: '421FC_03',
      questionImageSrc: '/flashcards/421FC_03Q.png',
      answerImageSrc: '/flashcards/421FC_03R.png',
      status: 'pending',
      box: 2,
      lastReviewed: new Date(Date.now() - 86400000), // 1 day ago
      nextReviewDate: new Date(Date.now() + 86400000) // 1 day from now
    },
    {
      id: '421FC_04',
      questionImageSrc: '/flashcards/421FC_04Q.png',
      answerImageSrc: '/flashcards/421FC_04R.png',
      status: 'pending',
      box: 3,
      lastReviewed: new Date(Date.now() - 86400000 * 2), // 2 days ago
      nextReviewDate: new Date(Date.now() + 86400000 * 2) // 2 days from now
    },
    {
      id: '421FC_05',
      questionImageSrc: '/flashcards/421FC_05Q.png',
      answerImageSrc: '/flashcards/421FC_05R.png',
      status: 'pending',
      box: 4,
      lastReviewed: new Date(Date.now() - 86400000 * 3), // 3 days ago
      nextReviewDate: new Date(Date.now() + 86400000 * 4) // 4 days from now
    },
    {
      id: '420FC_01',
      questionImageSrc: '/flashcards/420FC_01Q.png',
      answerImageSrc: '/flashcards/420FC_01R.png',
      status: 'pending',
      box: 5,
      lastReviewed: new Date(Date.now() - 86400000 * 7), // 7 days ago
      nextReviewDate: new Date(Date.now() + 86400000 * 7) // 7 days from now
    },
    {
      id: '420FC_02',
      questionImageSrc: '/flashcards/420FC_02Q.png',
      answerImageSrc: '/flashcards/420FC_02R.png',
      status: 'pending',
      box: 6,
      lastReviewed: new Date(Date.now() - 86400000 * 14), // 14 days ago
      nextReviewDate: new Date(Date.now() + 86400000 * 16) // 16 days from now
    }
  ];

  // Simulate API delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockFlashcards);
    }, 500);
  });
};

// Update the flashcard after reviewing
export const updateFlashcardAfterReview = (
  flashcard: FlashCard, 
  isCorrect: boolean
): FlashCard => {
  const today = new Date();
  let newBox = flashcard.box;
  
  if (isCorrect) {
    // Move up a box if correct (max is 7)
    newBox = Math.min(7, flashcard.box + 1);
  } else {
    // Move back to box 1 if incorrect
    newBox = 1;
  }
  
  return {
    ...flashcard,
    box: newBox,
    status: isCorrect ? 'ok' : 'ko',
    lastReviewed: today,
    nextReviewDate: calculateNextReviewDate(newBox)
  };
};

// Get all cards due for review today
export const getDueFlashcards = (cards: FlashCard[]): FlashCard[] => {
  const today = new Date();
  
  return cards.filter(card => {
    // Include cards that have never been reviewed
    if (!card.nextReviewDate) {
      return true;
    }
    
    // Include cards due for review (nextReviewDate <= today)
    return card.nextReviewDate <= today;
  });
};

// This would be a real API call in production
export const saveFlashcardStatus = async (
  cardId: string, 
  status: 'pending' | 'ok' | 'ko',
  box: number,
  lastReviewed: Date | null,
  nextReviewDate: Date | null
): Promise<void> => {
  // Simulate API call
  console.log(`Saving card ${cardId} with status ${status}, box ${box}`);
  return Promise.resolve();
}; 