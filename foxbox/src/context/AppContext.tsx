import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { Class, Student, FlashcardSet, StudentProgress, Flashcard } from '../types/models';
import { MAX_ACTIVE_BOX, LEARNED_BOX } from '../config/calendarConfig';

// --- Mock Data ---
// TODO: Replace with actual data fetching/parsing logic
const mockFlashcards: Flashcard[] = [
    // Set 421 - 16 cards
    { id: '421FC_01', questionImg: '/flashcards/421FC_01Q.png', answerImg: '/flashcards/421FC_01R.png' },
    { id: '421FC_02', questionImg: '/flashcards/421FC_02Q.png', answerImg: '/flashcards/421FC_02R.png' },
    { id: '421FC_03', questionImg: '/flashcards/421FC_03Q.png', answerImg: '/flashcards/421FC_03R.png' },
    { id: '421FC_04', questionImg: '/flashcards/421FC_04Q.png', answerImg: '/flashcards/421FC_04R.png' },
    { id: '421FC_05', questionImg: '/flashcards/421FC_05Q.png', answerImg: '/flashcards/421FC_05R.png' },
    { id: '421FC_06', questionImg: '/flashcards/421FC_06Q.png', answerImg: '/flashcards/421FC_06R.png' },
    { id: '421FC_07', questionImg: '/flashcards/421FC_07Q.png', answerImg: '/flashcards/421FC_07R.png' },
    { id: '421FC_08', questionImg: '/flashcards/421FC_08Q.png', answerImg: '/flashcards/421FC_08R.png' },
    { id: '421FC_09', questionImg: '/flashcards/421FC_09Q.png', answerImg: '/flashcards/421FC_09R.png' },
    { id: '421FC_10', questionImg: '/flashcards/421FC_10Q.png', answerImg: '/flashcards/421FC_10R.png' },
    { id: '421FC_11', questionImg: '/flashcards/421FC_11Q.png', answerImg: '/flashcards/421FC_11R.png' },
    { id: '421FC_12', questionImg: '/flashcards/421FC_12Q.png', answerImg: '/flashcards/421FC_12R.png' },
    { id: '421FC_13', questionImg: '/flashcards/421FC_13Q.png', answerImg: '/flashcards/421FC_13R.png' },
    { id: '421FC_14', questionImg: '/flashcards/421FC_14Q.png', answerImg: '/flashcards/421FC_14R.png' },
    { id: '421FC_15', questionImg: '/flashcards/421FC_15Q.png', answerImg: '/flashcards/421FC_15R.png' },
    { id: '421FC_16', questionImg: '/flashcards/421FC_16Q.png', answerImg: '/flashcards/421FC_16R.png' },

    // Set 420 - 16 cards
    { id: '420FC_01', questionImg: '/flashcards/420FC_01Q.png', answerImg: '/flashcards/420FC_01R.png' },
    { id: '420FC_02', questionImg: '/flashcards/420FC_02Q.png', answerImg: '/flashcards/420FC_02R.png' },
    { id: '420FC_03', questionImg: '/flashcards/420FC_03Q.png', answerImg: '/flashcards/420FC_03R.png' },
    { id: '420FC_04', questionImg: '/flashcards/420FC_04Q.png', answerImg: '/flashcards/420FC_04R.png' },
    { id: '420FC_05', questionImg: '/flashcards/420FC_05Q.png', answerImg: '/flashcards/420FC_05R.png' },
    { id: '420FC_06', questionImg: '/flashcards/420FC_06Q.png', answerImg: '/flashcards/420FC_06R.png' },
    { id: '420FC_07', questionImg: '/flashcards/420FC_07Q.png', answerImg: '/flashcards/420FC_07R.png' },
    { id: '420FC_08', questionImg: '/flashcards/420FC_08Q.png', answerImg: '/flashcards/420FC_08R.png' },
    { id: '420FC_09', questionImg: '/flashcards/420FC_09Q.png', answerImg: '/flashcards/420FC_09R.png' },
    { id: '420FC_10', questionImg: '/flashcards/420FC_10Q.png', answerImg: '/flashcards/420FC_10R.png' },
    { id: '420FC_11', questionImg: '/flashcards/420FC_11Q.png', answerImg: '/flashcards/420FC_11R.png' },
    { id: '420FC_12', questionImg: '/flashcards/420FC_12Q.png', answerImg: '/flashcards/420FC_12R.png' },
    { id: '420FC_13', questionImg: '/flashcards/420FC_13Q.png', answerImg: '/flashcards/420FC_13R.png' },
    { id: '420FC_14', questionImg: '/flashcards/420FC_14Q.png', answerImg: '/flashcards/420FC_14R.png' },
    { id: '420FC_15', questionImg: '/flashcards/420FC_15Q.png', answerImg: '/flashcards/420FC_15R.png' },
    { id: '420FC_16', questionImg: '/flashcards/420FC_16Q.png', answerImg: '/flashcards/420FC_16R.png' },

    // Set 414FC1 - 16 cards
    { id: '414FC1_01', questionImg: '/flashcards/414FC1_01Q.png', answerImg: '/flashcards/414FC1_01R.png' },
    { id: '414FC1_02', questionImg: '/flashcards/414FC1_02Q.png', answerImg: '/flashcards/414FC1_02R.png' },
    { id: '414FC1_03', questionImg: '/flashcards/414FC1_03Q.png', answerImg: '/flashcards/414FC1_03R.png' },
    { id: '414FC1_04', questionImg: '/flashcards/414FC1_04Q.png', answerImg: '/flashcards/414FC1_04R.png' },
    { id: '414FC1_05', questionImg: '/flashcards/414FC1_05Q.png', answerImg: '/flashcards/414FC1_05R.png' },
    { id: '414FC1_06', questionImg: '/flashcards/414FC1_06Q.png', answerImg: '/flashcards/414FC1_06R.png' },
    { id: '414FC1_07', questionImg: '/flashcards/414FC1_07Q.png', answerImg: '/flashcards/414FC1_07R.png' },
    { id: '414FC1_08', questionImg: '/flashcards/414FC1_08Q.png', answerImg: '/flashcards/414FC1_08R.png' },
    { id: '414FC1_09', questionImg: '/flashcards/414FC1_09Q.png', answerImg: '/flashcards/414FC1_09R.png' },
    { id: '414FC1_10', questionImg: '/flashcards/414FC1_10Q.png', answerImg: '/flashcards/414FC1_10R.png' },
    { id: '414FC1_11', questionImg: '/flashcards/414FC1_11Q.png', answerImg: '/flashcards/414FC1_11R.png' },
    { id: '414FC1_12', questionImg: '/flashcards/414FC1_12Q.png', answerImg: '/flashcards/414FC1_12R.png' },
    { id: '414FC1_13', questionImg: '/flashcards/414FC1_13Q.png', answerImg: '/flashcards/414FC1_13R.png' },
    { id: '414FC1_14', questionImg: '/flashcards/414FC1_14Q.png', answerImg: '/flashcards/414FC1_14R.png' },
    { id: '414FC1_15', questionImg: '/flashcards/414FC1_15Q.png', answerImg: '/flashcards/414FC1_15R.png' },
    { id: '414FC1_16', questionImg: '/flashcards/414FC1_16Q.png', answerImg: '/flashcards/414FC1_16R.png' },

    // Set 414FC2 - 16 cards
    { id: '414FC2_01', questionImg: '/flashcards/414FC2_01Q.png', answerImg: '/flashcards/414FC2_01R.png' },
    { id: '414FC2_02', questionImg: '/flashcards/414FC2_02Q.png', answerImg: '/flashcards/414FC2_02R.png' },
    { id: '414FC2_03', questionImg: '/flashcards/414FC2_03Q.png', answerImg: '/flashcards/414FC2_03R.png' },
    { id: '414FC2_04', questionImg: '/flashcards/414FC2_04Q.png', answerImg: '/flashcards/414FC2_04R.png' },
    { id: '414FC2_05', questionImg: '/flashcards/414FC2_05Q.png', answerImg: '/flashcards/414FC2_05R.png' },
    { id: '414FC2_06', questionImg: '/flashcards/414FC2_06Q.png', answerImg: '/flashcards/414FC2_06R.png' },
    { id: '414FC2_07', questionImg: '/flashcards/414FC2_07Q.png', answerImg: '/flashcards/414FC2_07R.png' },
    { id: '414FC2_08', questionImg: '/flashcards/414FC2_08Q.png', answerImg: '/flashcards/414FC2_08R.png' },
    { id: '414FC2_09', questionImg: '/flashcards/414FC2_09Q.png', answerImg: '/flashcards/414FC2_09R.png' },
    { id: '414FC2_10', questionImg: '/flashcards/414FC2_10Q.png', answerImg: '/flashcards/414FC2_10R.png' },
    { id: '414FC2_11', questionImg: '/flashcards/414FC2_11Q.png', answerImg: '/flashcards/414FC2_11R.png' },
    { id: '414FC2_12', questionImg: '/flashcards/414FC2_12Q.png', answerImg: '/flashcards/414FC2_12R.png' },
    { id: '414FC2_13', questionImg: '/flashcards/414FC2_13Q.png', answerImg: '/flashcards/414FC2_13R.png' },
    { id: '414FC2_14', questionImg: '/flashcards/414FC2_14Q.png', answerImg: '/flashcards/414FC2_14R.png' },
    { id: '414FC2_15', questionImg: '/flashcards/414FC2_15Q.png', answerImg: '/flashcards/414FC2_15R.png' },
    { id: '414FC2_16', questionImg: '/flashcards/414FC2_16Q.png', answerImg: '/flashcards/414FC2_16R.png' },

    // Set 411 - 16 cards
    { id: '411FC_01', questionImg: '/flashcards/411FC_01Q.png', answerImg: '/flashcards/411FC_01R.png' },
    { id: '411FC_02', questionImg: '/flashcards/411FC_02Q.png', answerImg: '/flashcards/411FC_02R.png' },
    { id: '411FC_03', questionImg: '/flashcards/411FC_03Q.png', answerImg: '/flashcards/411FC_03R.png' },
    { id: '411FC_04', questionImg: '/flashcards/411FC_04Q.png', answerImg: '/flashcards/411FC_04R.png' },
    { id: '411FC_05', questionImg: '/flashcards/411FC_05Q.png', answerImg: '/flashcards/411FC_05R.png' },
    { id: '411FC_06', questionImg: '/flashcards/411FC_06Q.png', answerImg: '/flashcards/411FC_06R.png' },
    { id: '411FC_07', questionImg: '/flashcards/411FC_07Q.png', answerImg: '/flashcards/411FC_07R.png' },
    { id: '411FC_08', questionImg: '/flashcards/411FC_08Q.png', answerImg: '/flashcards/411FC_08R.png' },
    { id: '411FC_09', questionImg: '/flashcards/411FC_09Q.png', answerImg: '/flashcards/411FC_09R.png' },
    { id: '411FC_10', questionImg: '/flashcards/411FC_10Q.png', answerImg: '/flashcards/411FC_10R.png' },
    { id: '411FC_11', questionImg: '/flashcards/411FC_11Q.png', answerImg: '/flashcards/411FC_11R.png' },
    { id: '411FC_12', questionImg: '/flashcards/411FC_12Q.png', answerImg: '/flashcards/411FC_12R.png' },
    { id: '411FC_13', questionImg: '/flashcards/411FC_13Q.png', answerImg: '/flashcards/411FC_13R.png' },
    { id: '411FC_14', questionImg: '/flashcards/411FC_14Q.png', answerImg: '/flashcards/411FC_14R.png' },
    { id: '411FC_15', questionImg: '/flashcards/411FC_15Q.png', answerImg: '/flashcards/411FC_15R.png' },
    { id: '411FC_16', questionImg: '/flashcards/411FC_16Q.png', answerImg: '/flashcards/411FC_16R.png' },

    // Set 413 - 16 cards
    { id: '413FC_01', questionImg: '/flashcards/413FC_01Q.png', answerImg: '/flashcards/413FC_01R.png' },
    { id: '413FC_02', questionImg: '/flashcards/413FC_02Q.png', answerImg: '/flashcards/413FC_02R.png' },
    { id: '413FC_03', questionImg: '/flashcards/413FC_03Q.png', answerImg: '/flashcards/413FC_03R.png' },
    { id: '413FC_04', questionImg: '/flashcards/413FC_04Q.png', answerImg: '/flashcards/413FC_04R.png' },
    { id: '413FC_05', questionImg: '/flashcards/413FC_05Q.png', answerImg: '/flashcards/413FC_05R.png' },
    { id: '413FC_06', questionImg: '/flashcards/413FC_06Q.png', answerImg: '/flashcards/413FC_06R.png' },
    { id: '413FC_07', questionImg: '/flashcards/413FC_07Q.png', answerImg: '/flashcards/413FC_07R.png' },
    { id: '413FC_08', questionImg: '/flashcards/413FC_08Q.png', answerImg: '/flashcards/413FC_08R.png' },
    { id: '413FC_09', questionImg: '/flashcards/413FC_09Q.png', answerImg: '/flashcards/413FC_09R.png' },
    { id: '413FC_10', questionImg: '/flashcards/413FC_10Q.png', answerImg: '/flashcards/413FC_10R.png' },
    { id: '413FC_11', questionImg: '/flashcards/413FC_11Q.png', answerImg: '/flashcards/413FC_11R.png' },
    { id: '413FC_12', questionImg: '/flashcards/413FC_12Q.png', answerImg: '/flashcards/413FC_12R.png' },
    { id: '413FC_13', questionImg: '/flashcards/413FC_13Q.png', answerImg: '/flashcards/413FC_13R.png' },
    { id: '413FC_14', questionImg: '/flashcards/413FC_14Q.png', answerImg: '/flashcards/413FC_14R.png' },
    { id: '413FC_15', questionImg: '/flashcards/413FC_15Q.png', answerImg: '/flashcards/413FC_15R.png' },
    { id: '413FC_16', questionImg: '/flashcards/413FC_16Q.png', answerImg: '/flashcards/413FC_16R.png' },

    // Set FC410 - 16 cards
    { id: 'FC410_01', questionImg: '/flashcards/FC410_01Q.png', answerImg: '/flashcards/FC410_01R.png' },
    { id: 'FC410_02', questionImg: '/flashcards/FC410_02Q.png', answerImg: '/flashcards/FC410_02R.png' },
    { id: 'FC410_03', questionImg: '/flashcards/FC410_03Q.png', answerImg: '/flashcards/FC410_03R.png' },
    { id: 'FC410_04', questionImg: '/flashcards/FC410_04Q.png', answerImg: '/flashcards/FC410_04R.png' },
    { id: 'FC410_05', questionImg: '/flashcards/FC410_05Q.png', answerImg: '/flashcards/FC410_05R.png' },
    { id: 'FC410_06', questionImg: '/flashcards/FC410_06Q.png', answerImg: '/flashcards/FC410_06R.png' },
    { id: 'FC410_07', questionImg: '/flashcards/FC410_07Q.png', answerImg: '/flashcards/FC410_07R.png' },
    { id: 'FC410_08', questionImg: '/flashcards/FC410_08Q.png', answerImg: '/flashcards/FC410_08R.png' },
    { id: 'FC410_09', questionImg: '/flashcards/FC410_09Q.png', answerImg: '/flashcards/FC410_09R.png' },
    { id: 'FC410_10', questionImg: '/flashcards/FC410_10Q.png', answerImg: '/flashcards/FC410_10R.png' },
    { id: 'FC410_11', questionImg: '/flashcards/FC410_11Q.png', answerImg: '/flashcards/FC410_11R.png' },
    { id: 'FC410_12', questionImg: '/flashcards/FC410_12Q.png', answerImg: '/flashcards/FC410_12R.png' },
    { id: 'FC410_13', questionImg: '/flashcards/FC410_13Q.png', answerImg: '/flashcards/FC410_13R.png' },
    { id: 'FC410_14', questionImg: '/flashcards/FC410_14Q.png', answerImg: '/flashcards/FC410_14R.png' },
    { id: 'FC410_15', questionImg: '/flashcards/FC410_15Q.png', answerImg: '/flashcards/FC410_15R.png' },
    { id: 'FC410_16', questionImg: '/flashcards/FC410_16Q.png', answerImg: '/flashcards/FC410_16R.png' },
];

const mockFlashcardSets: FlashcardSet[] = [
    {
        id: '421',
        name: 'Chapter 421',
        flashcards: mockFlashcards.filter(fc => fc.id.startsWith('421FC')),
    },
    {
        id: '420',
        name: 'Chapter 420',
        flashcards: mockFlashcards.filter(fc => fc.id.startsWith('420FC')),
    },
    {
        id: '414.1', // Using dot notation for clarity
        name: 'Chapter 414 (Set 1)',
        flashcards: mockFlashcards.filter(fc => fc.id.startsWith('414FC1')),
    },
     {
        id: '414.2',
        name: 'Chapter 414 (Set 2)',
        flashcards: mockFlashcards.filter(fc => fc.id.startsWith('414FC2')),
    },
];

const mockStudents: Student[] = [
    { id: 's1', name: 'Alice' },
    { id: 's2', name: 'Bob' },
    { id: 's3', name: 'Charlie' },
    { id: 's4', name: 'David' },
    { id: 's5', name: 'Eve' },
    { id: 's6', name: 'Frank' },
    { id: 's7', name: 'Grace' },
];

const mockClasses: Class[] = [
    {
        id: '4B', name: 'Class 4B', students: [
            mockStudents[0], // Alice
            mockStudents[1], // Bob
        ]
    },
    {
        id: '4J', name: 'Class 4J', students: [
            mockStudents[2], // Charlie
            mockStudents[3], // David
            mockStudents[4], // Eve
        ]
    },
    {
        id: '4R', name: 'Class 4R', students: [
             mockStudents[5], // Frank
             mockStudents[6], // Grace
        ]
    },
    // Add other classes: 4V, DIS11, DIS12
];

// --- Constants ---
const LOCAL_STORAGE_KEY = 'foxboxStudentProgress';

// --- Context Definition ---
interface AppContextType {
    flashcardSets: FlashcardSet[];
    classes: Class[];
    studentProgress: { [studentId: string]: StudentProgress };
    assignSetToClass: (setId: string, classId: string) => void;
    getStudentProgress: (studentId: string) => StudentProgress | undefined;
    updateCardProgress: (studentId: string, cardId: string, correct: boolean) => void;
    resetAllProgress: () => void;
    getStudentCurrentDay: (studentId: string) => number;
    updateStudentCurrentDay: (studentId: string, day: number) => void;
    trackStudentUsage: (studentId: string) => void;
    getStudentUsageDates: (studentId: string, days?: number) => string[];
    getStudentCompletedDates: (studentId: string, days?: number) => string[];
    getStudentPartialDates: (studentId: string, days?: number) => string[];
    getStudentFirstActivityDate: (studentId: string) => string | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Context Provider ---
interface AppProviderProps {
    children: ReactNode;
}

// Mock student progress (empty at first)
const mockStudentProgress: { [studentId: string]: StudentProgress } = {
    alice: { studentId: 'alice', progress: {} },
    bob: { studentId: 'bob', progress: {} },
    charlie: { studentId: 'charlie', progress: {} },
    david: { studentId: 'david', progress: {} },
    eve: { studentId: 'eve', progress: {} },
    frank: { studentId: 'frank', progress: {} },
    grace: { studentId: 'grace', progress: {} }
};

// Add mock usage dates to existing mock student progress
const addMockUsageDates = (progress: { [studentId: string]: StudentProgress }) => {
    const newProgress = JSON.parse(JSON.stringify(progress));
    const today = new Date();
    
    // Helper to generate random past dates within the last 21 days
    const generateRandomDates = (count: number): string[] => {
        const dates: string[] = [];
        for (let i = 0; i < count; i++) {
            const daysAgo = Math.floor(Math.random() * 21); // 0-20 days ago
            const date = new Date(today);
            date.setDate(today.getDate() - daysAgo);
            dates.push(date.toISOString().split('T')[0]);
        }
        // Remove duplicates and convert to array
        return Array.from(new Set(dates));
    };
    
    // Add usage dates for each student
    // Alice - very active student
    if (newProgress['alice']) {
        newProgress['alice'].usageDates = generateRandomDates(15);
    }
    
    // Bob - moderately active
    if (newProgress['bob']) {
        newProgress['bob'].usageDates = generateRandomDates(8);
    }
    
    // Charlie - less active
    if (newProgress['charlie']) {
        newProgress['charlie'].usageDates = generateRandomDates(4);
    }
    
    // David - sporadic usage
    if (newProgress['david']) {
        newProgress['david'].usageDates = generateRandomDates(3);
    }
    
    // Eve - very active
    if (newProgress['eve']) {
        newProgress['eve'].usageDates = generateRandomDates(18);
    }
    
    return newProgress;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [flashcardSetsState, setFlashcardSetsState] = useState<FlashcardSet[]>(mockFlashcardSets);
    const [classesState, setClassesState] = useState<Class[]>(mockClasses);
    
    // Initialize student progress from localStorage or with mock data
    const [studentProgress, setStudentProgress] = useState<{ [studentId: string]: StudentProgress }>(() => {
        let initialProgress;
        try {
            const savedProgress = localStorage.getItem(LOCAL_STORAGE_KEY);
            initialProgress = savedProgress ? JSON.parse(savedProgress) : {};
            
            // If there's no saved progress, use mock data
            if (Object.keys(initialProgress).length === 0) {
                initialProgress = mockStudentProgress;
                // Add mock usage dates
                initialProgress = addMockUsageDates(initialProgress);
            }
        } catch (error) {
            console.error("Error loading student progress from localStorage:", error);
            initialProgress = mockStudentProgress;
            // Add mock usage dates
            initialProgress = addMockUsageDates(initialProgress);
        }
        return initialProgress;
    });

    // Effect to save progress to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(studentProgress));
        } catch (error) {
             console.error("Error saving student progress to localStorage:", error);
        }
    }, [studentProgress]);

    const assignSetToClass = useCallback((setId: string, classId: string) => {
        const set = flashcardSetsState.find(s => s.id === setId);
        const targetClass = classesState.find(c => c.id === classId);

        if (!set || !targetClass) {
            console.error("Set or Class not found for assignment");
            return;
        }

        // Use functional update to ensure we have the latest state
        setStudentProgress(prevProgress => {
            const newProgress = JSON.parse(JSON.stringify(prevProgress)); // Deep copy
            targetClass.students.forEach((student: Student) => {
                const studentId = student.id;
                if (!newProgress[studentId]) {
                    newProgress[studentId] = { studentId, progress: {} };
                }
                set.flashcards.forEach((card: Flashcard) => {
                    if (!newProgress[studentId].progress[card.id]) {
                        newProgress[studentId].progress[card.id] = {
                            cardId: card.id,
                            box: 1, // Add to the first box
                            // lastReviewed: undefined, // Optional initialization
                            // nextReview: undefined, // Optional initialization
                        };
                    }
                });
            });
            return newProgress;
        });

        console.log(`Assigned Set ${setId} to Class ${classId}`);
    }, [flashcardSetsState, classesState]);

    const getStudentProgress = useCallback((studentId: string): StudentProgress | undefined => {
      return studentProgress[studentId];
    }, [studentProgress]);

    // Get the current day for a student (default to 0 if not set)
    const getStudentCurrentDay = useCallback((studentId: string): number => {
        const student = studentProgress[studentId];
        return student?.currentDay ?? 0;
    }, [studentProgress]);

    // Update the current day for a student
    const updateStudentCurrentDay = useCallback((studentId: string, day: number) => {
        setStudentProgress(prevProgress => {
            // Deep copy the previous state
            const newProgress = JSON.parse(JSON.stringify(prevProgress));
            
            // If this student doesn't exist yet, create an entry
            if (!newProgress[studentId]) {
                newProgress[studentId] = { 
                    studentId, 
                    progress: {},
                    currentDay: day
                };
            } else {
                // Update the current day
                newProgress[studentId].currentDay = day;
            }
            
            return newProgress;
        });
    }, []);

    // Function to update a card's box based on correctness
    const updateCardProgress = useCallback((studentId: string, cardId: string, correct: boolean) => {
        setStudentProgress(prevProgress => {
            const studentProgressData = prevProgress[studentId];
            const cardProgressEntry = studentProgressData?.progress[cardId];
            
            if (!studentProgressData || !cardProgressEntry) {
                console.warn(`Progress not found for student ${studentId}, card ${cardId}. Cannot update.`);
                return prevProgress; 
            }

            const currentBox = cardProgressEntry.box;
            let nextBox: number;

            if (correct) {
                // If correct in Box 7, move to Box 8 (Learned)
                // Otherwise, move to next box
                nextBox = currentBox >= MAX_ACTIVE_BOX ? LEARNED_BOX : currentBox + 1;
            } else {
                // Incorrect always goes back to Box 1
                nextBox = 1;
            }

            // --- Enhanced Logging --- 
            console.log(`[updateCardProgress] Student: ${studentId}, Card: ${cardId}, Correct: ${correct}, Current Box: ${currentBox}, Calculated Next Box: ${nextBox}`);
            // ---------------------- 

            const updatedCardProgress = {
                ...cardProgressEntry,
                box: nextBox, 
                lastReviewed: new Date(),
            };

            const newOverallProgress = JSON.parse(JSON.stringify(prevProgress));
            newOverallProgress[studentId].progress[cardId] = updatedCardProgress;
            
            // --- Log state *before* returning --- 
            console.log('[updateCardProgress] New state being returned:', newOverallProgress[studentId].progress[cardId]);
            // ----------------------------------- 

            return newOverallProgress;
        });
    }, []);

    // Function to reset all student progress
    const resetAllProgress = useCallback(() => {
        if (window.confirm("Are you sure you want to reset all student progress? This cannot be undone.")) {
            console.log("Resetting all student progress...");
            setStudentProgress({}); // Set state to empty object
            // The useEffect hook above will handle updating localStorage
        }
    }, []);

    // Function to track student usage (add today's date to their usage history)
    const trackStudentUsage = useCallback((studentId: string) => {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        setStudentProgress(prevProgress => {
            // Deep copy the previous state
            const newProgress = JSON.parse(JSON.stringify(prevProgress));
            
            // If this student doesn't exist yet, create an entry
            if (!newProgress[studentId]) {
                newProgress[studentId] = { 
                    studentId, 
                    progress: {},
                    usageDates: [today]
                };
            } else {
                // Initialize usageDates array if it doesn't exist
                if (!newProgress[studentId].usageDates) {
                    newProgress[studentId].usageDates = [];
                }
                
                // Add today's date if it's not already in the array
                if (!newProgress[studentId].usageDates.includes(today)) {
                    newProgress[studentId].usageDates.push(today);
                }
            }
            
            return newProgress;
        });
    }, []);
    
    // Function to get student usage dates
    const getStudentUsageDates = useCallback((studentId: string, days = 30): string[] => {
        const student = studentProgress[studentId];
        if (!student || !student.usageDates) {
            return [];
        }
        
        // Sort dates in descending order (newest first)
        const sortedDates = [...student.usageDates].sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
        );
        
        // Return the most recent 'days' number of dates
        return sortedDates.slice(0, days);
    }, [studentProgress]);

    // Get dates when student completed all exercises
    const getStudentCompletedDates = useCallback((studentId: string, days = 30): string[] => {
        const student = studentProgress[studentId];
        if (!student || !student.usageDates) {
            return [];
        }
        
        // A session is considered "complete" if all assigned cards were reviewed on that day
        const completedDates: string[] = [];
        
        // Special case for student s6 (Frank) - mark as incomplete
        if (studentId === 's6') {
            return []; // Frank's sessions are all incomplete
        }
        
        // For other students, use the simplified logic for now
        // In a real implementation, you would check if all assigned cards were reviewed on each date
        const usageDates = student.usageDates;
        
        // For demo, alternating days as complete (except for Frank)
        if (studentId !== 's6') {
            const sortedDates = [...usageDates].sort();
            return sortedDates.filter((_, i) => i % 2 === 0).slice(-days);
        }
        
        return completedDates;
    }, [studentProgress]);

    // Get dates when student had partial completion
    const getStudentPartialDates = useCallback((studentId: string, days = 30): string[] => {
        const student = studentProgress[studentId];
        if (!student || !student.usageDates) {
            return [];
        }
        
        // Special case for student s6 (Frank) - all sessions are partial
        if (studentId === 's6') {
            return student.usageDates.slice(-days); // All of Frank's sessions are partial
        }
        
        // For other students, consider all usage dates that aren't in the completed set as partial
        const usageDates = student.usageDates;
        const completedDates = new Set(getStudentCompletedDates(studentId, days));
        
        // Return dates that are in usage but not in completed
        return usageDates.filter(date => !completedDates.has(date)).slice(-days);
    }, [studentProgress, getStudentCompletedDates]);

    // Get the first date student ever practiced
    const getStudentFirstActivityDate = useCallback((studentId: string): string | undefined => {
        const student = studentProgress[studentId];
        if (!student || !student.usageDates || student.usageDates.length === 0) {
            return undefined;
        }
        
        // Find the earliest date
        return [...student.usageDates].sort()[0];
    }, [studentProgress]);

    // Log state before providing it
    console.log("[AppProvider] Current studentProgress state:", JSON.stringify(studentProgress));

    // Memoize context value
    const contextValue = useMemo(() => ({
        flashcardSets: flashcardSetsState,
        classes: classesState,
        studentProgress,
        assignSetToClass,
        getStudentProgress,
        updateCardProgress,
        resetAllProgress,
        getStudentCurrentDay,
        updateStudentCurrentDay,
        trackStudentUsage,
        getStudentUsageDates,
        getStudentCompletedDates,
        getStudentPartialDates,
        getStudentFirstActivityDate,
    }), [
        flashcardSetsState,
        classesState,
        studentProgress,
        assignSetToClass,
        getStudentProgress,
        updateCardProgress,
        resetAllProgress,
        getStudentCurrentDay,
        updateStudentCurrentDay,
        trackStudentUsage,
        getStudentUsageDates,
        getStudentCompletedDates,
        getStudentPartialDates,
        getStudentFirstActivityDate,
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

// --- Custom Hook ---
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}; 