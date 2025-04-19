export interface FlashCard {
  id: string;
  questionImageSrc: string;
  answerImageSrc: string;
  status: 'pending' | 'ok' | 'ko';
  box: number; // Box 1-7 for Leitner system
  lastReviewed: Date | null;
  nextReviewDate: Date | null;
} 