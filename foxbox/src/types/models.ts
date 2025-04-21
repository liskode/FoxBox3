export interface Flashcard {
  id: string; // e.g., '421FC_01Q'
  questionImg: string;
  answerImg: string;
}

export interface FlashcardSet {
  id: string; // e.g., '421'
  name: string; // e.g., 'Chapter 421'
  flashcards: Flashcard[];
}

export interface Student {
  id: string;
  name: string;
}

export interface Class {
  id: string; // e.g., '4B'
  name: string;
  students: Student[];
}

// Represents the progress of a single student on a single flashcard
export interface CardProgress {
  cardId: string;
  box: number; // Box number in the SRS (e.g., 1, 2, 3...)
  lastReviewed?: Date;
  nextReview?: Date;
}

// Represents all progress for a single student
export interface StudentProgress {
  studentId: string;
  progress: { [cardId: string]: CardProgress };
  currentDay?: number; // Track current calendar day for this student
  usageDates?: string[]; // Array of ISO date strings (YYYY-MM-DD) when the student used the app
} 