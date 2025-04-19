export interface FlashCard {
  id: string;
  questionImageSrc: string;
  answerImageSrc: string;
  status: 'pending' | 'ok' | 'ko';
} 