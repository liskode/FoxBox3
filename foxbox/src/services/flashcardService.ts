import axios from 'axios';
import { FlashCard } from '../types/FlashCard';

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
      status: 'pending'
    },
    {
      id: '421FC_02',
      questionImageSrc: '/flashcards/421FC_02Q.png',
      answerImageSrc: '/flashcards/421FC_02R.png',
      status: 'pending'
    },
    {
      id: '421FC_03',
      questionImageSrc: '/flashcards/421FC_03Q.png',
      answerImageSrc: '/flashcards/421FC_03R.png',
      status: 'pending'
    },
    {
      id: '421FC_04',
      questionImageSrc: '/flashcards/421FC_04Q.png',
      answerImageSrc: '/flashcards/421FC_04R.png',
      status: 'pending'
    },
    {
      id: '421FC_05',
      questionImageSrc: '/flashcards/421FC_05Q.png',
      answerImageSrc: '/flashcards/421FC_05R.png',
      status: 'pending'
    },
    {
      id: '420FC_01',
      questionImageSrc: '/flashcards/420FC_01Q.png',
      answerImageSrc: '/flashcards/420FC_01R.png',
      status: 'pending'
    },
    {
      id: '420FC_02',
      questionImageSrc: '/flashcards/420FC_02Q.png',
      answerImageSrc: '/flashcards/420FC_02R.png',
      status: 'pending'
    }
  ];

  // Simulate API delay
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockFlashcards);
    }, 500);
  });
};

// This would be a real API call in production
export const saveFlashcardStatus = async (
  cardId: string, 
  status: 'pending' | 'ok' | 'ko'
): Promise<void> => {
  // Simulate API call
  console.log(`Saving card ${cardId} with status ${status}`);
  return Promise.resolve();
}; 