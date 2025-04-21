import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { Flashcard, StudentProgress } from '../../types/models';
import { Container, Card, CardMedia, Typography, Button, Box, CircularProgress } from '@mui/material';
import DailyCalendarView from '../../components/student/DailyCalendarView';
import { CALENDAR_LENGTH, REVIEW_SCHEDULE } from '../../config/calendarConfig';

// Define study phases
type StudyPhase = 'initial' | 'box1Loop';

const StudentStudyPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const { 
        getStudentProgress, 
        flashcardSets, 
        classes, 
        updateCardProgress,
        getStudentCurrentDay,
        updateStudentCurrentDay,
        trackStudentUsage
    } = useAppContext();

    const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
    const [showAnswer, setShowAnswer] = useState<boolean>(false);
    const [studyDeck, setStudyDeck] = useState<Flashcard[]>([]);
    const [deckTitle, setDeckTitle] = useState<string>('');
    const [studentName, setStudentName] = useState<string>('Unknown Student');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentDay, setCurrentDay] = useState<number>(0);
    const [studyPhase, setStudyPhase] = useState<StudyPhase>('initial');
    const [failedCardIdsThisSession, setFailedCardIdsThisSession] = useState<Set<string>>(new Set());

    // Load the student's current day when component mounts
    useEffect(() => {
        if (studentId) {
            const savedDay = getStudentCurrentDay(studentId);
            setCurrentDay(savedDay);
        }
    }, [studentId, getStudentCurrentDay]);

    // Function to load the study deck based on the current day and phase
    const loadStudyDeck = useCallback((phase: StudyPhase, cardIdsToLoad?: string[]) => {
        console.log(`Loading deck for phase: ${phase}, day: ${currentDay}`);
        
        // Only clear failures when starting a fresh initial phase, not when transitioning to box1Loop
        if (phase === 'initial') {
            setFailedCardIdsThisSession(new Set());
        }

        if (!studentId) {
            setIsLoading(false); // Ensure loading stops if no student
            setStudyDeck([]);
            setDeckTitle('No student selected');
            return;
        }

        const student = classes.flatMap(c => c.students).find(s => s.id === studentId);
        setStudentName(student ? student.name : 'Unknown Student');

        const progress: StudentProgress | undefined = getStudentProgress(studentId);
        let cardsToReviewIds: string[] = [];
        let currentDeckTitle = '';
        
        // Debug progress data
        console.log(`Student progress for ${studentId}:`, progress ? JSON.stringify(progress.progress) : 'undefined');

        if (phase === 'initial') {
            const maxBoxForDay = REVIEW_SCHEDULE[currentDay] ?? 1;
            console.log(`Current day: ${currentDay}, Max box for review: ${maxBoxForDay}`);
            
            // Generate boxesToReview array (always include Box 1)
            const boxesToReview = Array.from({ length: maxBoxForDay }, (_, i) => i + 1);
            console.log(`Boxes to review today: ${boxesToReview.join(', ')}`);
            
            currentDeckTitle = `Reviewing Boxes: ${boxesToReview.join(', ')}`;
            
            if (progress) {
                // Log card distribution by box
                const boxDistribution: {[box: number]: number} = {};
                Object.values(progress.progress).forEach(card => {
                    boxDistribution[card.box] = (boxDistribution[card.box] || 0) + 1;
                });
                console.log('Card distribution by box:', boxDistribution);
                
                // Select cards that are in the boxes to review
                cardsToReviewIds = Object.values(progress.progress)
                    .filter(p => boxesToReview.includes(p.box))
                    .map(p => p.cardId);
                    
                console.log(`Found ${cardsToReviewIds.length} cards in boxes ${boxesToReview.join(', ')}`);
                
                // If no cards found in the scheduled boxes, include Box 1 cards as fallback
                if (cardsToReviewIds.length === 0) {
                    console.log('No cards found in scheduled boxes. Adding all Box 1 cards as fallback.');
                    
                    // Add all cards from Box 1 as a fallback
                    const box1Cards = Object.values(progress.progress)
                        .filter(p => p.box === 1)
                        .map(p => p.cardId);
                        
                    cardsToReviewIds = box1Cards;
                    
                    // If still no cards, consider all assigned cards
                    if (cardsToReviewIds.length === 0) {
                        console.log('No Box 1 cards either. Adding all assigned cards.');
                        cardsToReviewIds = Object.values(progress.progress).map(p => p.cardId);
                    }
                }
            }
        } else { // phase === 'box1Loop'
            currentDeckTitle = 'Reviewing Box 1 (Loop)';
            // Load specific cards passed in, or query Box 1 if none passed (fallback)
            if (cardIdsToLoad && cardIdsToLoad.length > 0) {
                 cardsToReviewIds = cardIdsToLoad;
                 console.log(`Loading ${cardsToReviewIds.length} specific failed cards for Box 1 loop`);
            } else if (progress) { // Fallback: load all cards currently in box 1
                 console.warn("Loading Box 1 loop without explicit card IDs, loading all from Box 1.");
                 cardsToReviewIds = Object.values(progress.progress)
                    .filter(p => p.box === 1)
                    .map(p => p.cardId);
                 console.log(`Found ${cardsToReviewIds.length} cards in Box 1 for loop`);
            }
        }

        setDeckTitle(currentDeckTitle);

        if (cardsToReviewIds.length === 0) {
             console.log("No cards to review. Checking if there are any cards assigned at all.");
             
             // One more fallback - if student has any cards at all, show them
             if (progress && Object.keys(progress.progress).length > 0) {
                 console.log(`Student has ${Object.keys(progress.progress).length} cards total. Adding all as fallback.`);
                 cardsToReviewIds = Object.keys(progress.progress);
                 currentDeckTitle = "Review All Cards (No scheduled cards found)";
                 setDeckTitle(currentDeckTitle);
             } else {
                 setStudyDeck([]);
                 setCurrentCardIndex(0);
                 setShowAnswer(false);
                 setIsLoading(false); // Stop loading if deck is empty
                 console.log("No cards assigned to this student.");
                 return;
             }
        }

        const allFlashcards = flashcardSets.flatMap(set => set.flashcards);
        console.log(`Total flashcards available: ${allFlashcards.length}`);
        
        let deck = allFlashcards.filter(card => cardsToReviewIds.includes(card.id));
        console.log(`Matched ${deck.length} cards out of ${cardsToReviewIds.length} IDs`);
        
        // Check for missing cards
        if (deck.length < cardsToReviewIds.length) {
            const foundIds = deck.map(card => card.id);
            const missingIds = cardsToReviewIds.filter(id => !foundIds.includes(id));
            console.warn(`Missing ${missingIds.length} cards: ${missingIds.join(', ')}`);
        }

        // If we still don't have any cards, use ALL flashcards as a last resort
        if (deck.length === 0 && allFlashcards.length > 0) {
            console.warn("No cards matched the IDs. Using random cards as a fallback.");
            // Pick random 5 cards as fallback
            deck = [...allFlashcards].sort(() => 0.5 - Math.random()).slice(0, 5);
            currentDeckTitle = "Random Cards (Debug Mode)";
            setDeckTitle(currentDeckTitle);
        }

        // Shuffle
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        console.log(`Loaded ${deck.length} cards for ${phase} phase.`);
        setStudyDeck(deck);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setIsLoading(false); // Stop loading once deck is processed

    }, [studentId, currentDay, getStudentProgress, flashcardSets, classes]);

    // Effect for initial deck load ONLY on student/day change
    useEffect(() => {
        console.log("Effect: studentId or currentDay changed. Loading initial deck.");
        setIsLoading(true); // Set loading before calling load
        loadStudyDeck('initial');
        setStudyPhase('initial'); // Ensure phase is reset
        
        // Track student usage when they access the study page
        if (studentId) {
            trackStudentUsage(studentId);
        }
    }, [studentId, currentDay, trackStudentUsage]);

    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    const handleNextCard = (correct: boolean) => {
        const currentCard = studyDeck[currentCardIndex];
        if (!currentCard || !studentId) return;

        updateCardProgress(studentId, currentCard.id, correct);

        // Update failures list based on answer
        if (correct) {
            // If answered correctly, remove from failures list (if it was there)
            setFailedCardIdsThisSession(prev => {
                const newSet = new Set(prev);
                newSet.delete(currentCard.id);
                return newSet;
            });
            if (failedCardIdsThisSession.has(currentCard.id)) {
                console.log(`Removed ${currentCard.id} from failures list after correct answer.`);
            }
        } else {
            // If answered incorrectly, add to failures list
            setFailedCardIdsThisSession(prev => new Set(prev).add(currentCard.id));
            console.log(`Added ${currentCard.id} to failed list for this session.`);
        }

        const isLastCardInDeck = currentCardIndex >= studyDeck.length - 1;

        if (isLastCardInDeck) {
            // Get the UPDATED failures list (after processing the current card)
            // We need to handle this specially since React state updates are asynchronous
            const currentFailures = Array.from(failedCardIdsThisSession);
            const updatedFailures = 
                correct 
                    ? currentFailures.filter(id => id !== currentCard.id)
                    : [...currentFailures, currentCard.id];
            
            console.log(`End of deck for phase ${studyPhase}. Failures this pass:`, updatedFailures);

            if (updatedFailures.length > 0) {
                console.log(`Starting/Continuing Box 1 loop with ${updatedFailures.length} failed cards.`);
                setIsLoading(true); // Set loading before starting the loop load
                setStudyPhase('box1Loop');
                loadStudyDeck('box1Loop', updatedFailures);
                // Don't hide answer yet, wait for loop load
            } else {
                // Session complete (either initial or loop phase)
                if (studyPhase === 'box1Loop') {
                    console.log("Box 1 loop complete with no failures. Session complete.");
                } else {
                     console.log("Initial phase complete with no failures. Session complete.");
                }
                setShowAnswer(false); // Hide answer as session is ending
                alert(`Daily study complete! Well done!`);
                navigate('/teacher');
            }
        } else {
            // Not the last card, advance and hide answer
            setShowAnswer(false);
            setCurrentCardIndex(currentCardIndex + 1);
        }
    };

    const handleNextDay = () => {
        const nextDay = (currentDay + 1) % CALENDAR_LENGTH;
        
        // Update both local state and stored state
        setCurrentDay(nextDay);
        
        // Save this student's calendar position
        if (studentId) {
            updateStudentCurrentDay(studentId, nextDay);
        }
        
        // The useEffect depending on currentDay will trigger reload
    };

    // --- Render Logic ---
    if (!studentId) {
        return <Container><Typography>No student selected.</Typography></Container>;
    }

    // Loading indicator shows calendar
    if (isLoading) {
         return (
            <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Daily Schedule (Day {currentDay + 1} / {CALENDAR_LENGTH})</Typography>
                    <DailyCalendarView currentDay={currentDay} />
                    <Button onClick={handleNextDay} variant="outlined" size="small" sx={{ mt: 3.5 }} disabled>Simulate Next Day</Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h5" gutterBottom>Studying: {studentName}</Typography>
                    <CircularProgress sx={{mt: 3}}/>
                    <Typography sx={{mt: 2}}>Loading cards for {deckTitle}...</Typography>
                </Box>
            </Container>
        );
    }

    // Main content rendering
    return (
        <Container maxWidth="md" sx={{ mt: 2, mb: 4 }}>
             <Box sx={{ mb: 3 }}>
                 <Typography variant="h6" gutterBottom>Daily Schedule (Day {currentDay + 1} / {CALENDAR_LENGTH})</Typography>
                 <DailyCalendarView currentDay={currentDay} />
                 <Button onClick={handleNextDay} variant="outlined" size="small" sx={{ mt: 3.5 }}>
                     Simulate Next Day
                 </Button>
             </Box>

             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <Typography variant="h5" gutterBottom>Studying: {studentName}</Typography>

                 {studyDeck.length === 0 ? (
                     <Box sx={{ textAlign: 'center' }}>
                         <Typography sx={{ my: 2 }}>No cards currently due for {deckTitle}.</Typography>
                         {/* Decide if session should auto-end or provide button */}
                         {studyPhase === 'initial' && (
                            <Typography variant="caption">(Maybe check previous/next day?)</Typography>
                         )}
                         <Button onClick={() => navigate('/teacher')} sx={{mt: 2}}>Back to Dashboard</Button>
                     </Box>
                 ) : (
                     <>
                         <Typography gutterBottom>Card {currentCardIndex + 1} of {studyDeck.length} ({deckTitle})</Typography>
                         <Card sx={{ mb: 2, width: '100%', maxWidth: '400px' }}>
                              <CardMedia
                                 component="img"
                                 alt={showAnswer ? "Answer" : "Question"}
                                 height="300"
                                 image={showAnswer
                                     ? studyDeck[currentCardIndex]?.answerImg
                                     : studyDeck[currentCardIndex]?.questionImg}
                                 sx={{ objectFit: 'contain', backgroundColor: '#f0f0f0' }}
                             />
                         </Card>

                         <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                             {!showAnswer ? (
                                 <Button variant="contained" onClick={handleShowAnswer}>
                                     Show Answer
                                 </Button>
                             ) : (
                                 <>
                                     <Button variant="contained" color="success" onClick={() => handleNextCard(true)}>
                                         Correct
                                     </Button>
                                     <Button variant="contained" color="error" onClick={() => handleNextCard(false)}>
                                         Incorrect
                                     </Button>
                                 </>
                             )}
                         </Box>
                     </>
                 )}
             </Box>
         </Container>
    );
};

export default StudentStudyPage; 