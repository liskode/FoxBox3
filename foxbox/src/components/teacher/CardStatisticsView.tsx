import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    Typography, 
    Box, 
    Paper, 
    Tabs, 
    Tab, 
    Grid, 
    Card, 
    CardContent, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
    SelectChangeEvent,
    Tooltip,
    Divider,
    Popper,
    Fade
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { LEARNED_BOX, BOX_COLORS } from '../../config/calendarConfig';
import { Student, CardProgress, StudentProgress, Class, Flashcard, FlashcardSet } from '../../types/models';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PieChart from '@mui/icons-material/PieChart';

// Interface for card statistics
interface CardStats {
    totalCards: number;
    boxCounts: number[];
    successRate: number;
    errorRate: number;
    totalAttempts: number;
    totalClasses: number;
    totalStudents: number;
}

// Interface for success/error rate calculation
interface StudentAttemptStats {
    student: Student;
    class: Class;
    totalCards: number; 
    successfulMoves: number;
    attempts: number;
}

// Interface for individual card statistics
interface CardPerformance {
    cardId: string;
    questionImg: string;
    answerImg?: string;
    successRate: number;
    totalAttempts: number;
}

// Helper to calculate stats from progress data
const calculateOverallStats = (
    studentProgress: { [studentId: string]: StudentProgress },
    allStudents: Student[],
    allClasses: Class[],
    filterClassId?: string
): CardStats => {
    const boxCounts = Array(LEARNED_BOX + 1).fill(0);
    let totalCards = 0;
    let moveUpCount = 0;
    let totalAttempts = 0;
    
    // Map of student IDs to their respective classes
    const studentToClassMap = new Map<string, Class>();
    allClasses.forEach(cls => {
        cls.students.forEach(student => {
            studentToClassMap.set(student.id, cls);
        });
    });
    
    // Filter students if a class filter is applied
    const filteredStudentIds = filterClassId
        ? allStudents
            .filter(student => studentToClassMap.get(student.id)?.id === filterClassId)
            .map(student => student.id)
        : allStudents.map(student => student.id);
    
    // Process each student's progress
    filteredStudentIds.forEach(studentId => {
        const progress = studentProgress[studentId];
        if (progress) {
            // Count cards in each box
            Object.values(progress.progress).forEach(cardProgress => {
                if (cardProgress.box >= 1 && cardProgress.box <= LEARNED_BOX) {
                    boxCounts[cardProgress.box]++;
                    totalCards++;
                    
                    // If card is in box > 1, it has been moved up at least once
                    if (cardProgress.box > 1) {
                        moveUpCount++;
                        totalAttempts += cardProgress.box - 1; // Each level up is one successful attempt
                    }
                    
                    // In Leitner system, if card is in box N, it has been reviewed approximately N times
                    // (oversimplification but works for statistical purposes)
                    totalAttempts += cardProgress.box;
                }
            });
        }
    });
    
    // Calculate success/error rates
    const successRate = totalAttempts > 0 ? (moveUpCount / totalAttempts) * 100 : 0;
    const errorRate = totalAttempts > 0 ? 100 - successRate : 0;
    
    return {
        totalCards,
        boxCounts,
        successRate,
        errorRate,
        totalAttempts,
        totalClasses: filterClassId ? 1 : allClasses.length,
        totalStudents: filteredStudentIds.length
    };
};

// Calculate stats by class
const calculateStatsByClass = (
    studentProgress: { [studentId: string]: StudentProgress },
    allClasses: Class[]
): Map<string, CardStats> => {
    const statsByClass = new Map<string, CardStats>();
    
    allClasses.forEach(cls => {
        const studentIds = cls.students.map(student => student.id);
        const filteredProgress: { [studentId: string]: StudentProgress } = {};
        
        studentIds.forEach(id => {
            if (studentProgress[id]) {
                filteredProgress[id] = studentProgress[id];
            }
        });
        
        statsByClass.set(
            cls.id,
            calculateOverallStats(filteredProgress, cls.students, [cls])
        );
    });
    
    return statsByClass;
};

// Calculate performance for individual cards
const calculateCardPerformance = (
    studentProgress: { [studentId: string]: StudentProgress },
    allFlashcards: FlashcardSet[],
    filterClassId?: string,
    allStudents?: Student[],
    allClasses?: Class[]
): CardPerformance[] => {
    const cardAttempts: { [cardId: string]: { success: number, total: number } } = {};
    const cardImageMap: { [cardId: string]: { questionImg: string, answerImg: string } } = {};
    
    // Create a map of card IDs to their question and answer images
    allFlashcards.forEach(set => {
        set.flashcards.forEach((card: Flashcard) => {
            cardImageMap[card.id] = { 
                questionImg: card.questionImg,
                answerImg: card.answerImg
            };
        });
    });
    
    // Filter students if a class filter is applied
    let filteredStudentIds: string[] = [];
    
    if (filterClassId && allStudents && allClasses) {
        // Map of student IDs to their respective classes
        const studentToClassMap = new Map<string, Class>();
        allClasses.forEach(cls => {
            cls.students.forEach(student => {
                studentToClassMap.set(student.id, cls);
            });
        });
        
        filteredStudentIds = allStudents
            .filter(student => studentToClassMap.get(student.id)?.id === filterClassId)
            .map(student => student.id);
    } else {
        filteredStudentIds = Object.keys(studentProgress);
    }
    
    // Process each student's progress
    filteredStudentIds.forEach(studentId => {
        const progress = studentProgress[studentId];
        if (progress) {
            Object.values(progress.progress).forEach(cardProgress => {
                if (!cardAttempts[cardProgress.cardId]) {
                    cardAttempts[cardProgress.cardId] = { success: 0, total: 0 };
                }
                
                // In Leitner system, if card is in box N, it has been attempted approximately N times
                // and moved up N-1 times (if N > 1)
                const attempts = cardProgress.box;
                const successes = Math.max(0, cardProgress.box - 1);
                
                cardAttempts[cardProgress.cardId].total += attempts;
                cardAttempts[cardProgress.cardId].success += successes;
            });
        }
    });
    
    // Convert to array and calculate success rates
    const cardPerformance: CardPerformance[] = Object.keys(cardAttempts).map(cardId => ({
        cardId,
        questionImg: cardImageMap[cardId]?.questionImg || '',
        answerImg: cardImageMap[cardId]?.answerImg || '',
        successRate: cardAttempts[cardId].total > 0 
            ? (cardAttempts[cardId].success / cardAttempts[cardId].total) * 100 
            : 0,
        totalAttempts: cardAttempts[cardId].total
    }));
    
    // Sort by success rate (ascending) and filter out cards with no attempts
    return cardPerformance
        .filter(card => card.totalAttempts > 0)
        .sort((a, b) => a.successRate - b.successRate);
};

// Original BoxDistributionBars component (kept for other views)
const BoxDistributionBars: React.FC<{ stats: CardStats }> = ({ stats }) => {
    const maxBarHeight = 120; // pixels
    const barWidth = '32px'; 
    const spacing = '4px';
    
    if (stats.totalCards === 0) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: `${maxBarHeight}px` }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No cards data available
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: `${maxBarHeight}px`, justifyContent: 'center' }}>
            {stats.boxCounts.slice(1).map((count, index) => {
                const boxNumber = index + 1;
                const percentage = stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0;
                const height = (percentage / 100) * maxBarHeight;
                const bgColor = BOX_COLORS[boxNumber] || '#eee';

                return (
                    <Tooltip 
                        key={boxNumber}
                        title={`Box ${boxNumber}${boxNumber === LEARNED_BOX ? ' (Learned)' : ''}: ${count} card${count !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`} 
                        placement="top"
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            {count > 0 && (
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        display: 'block', 
                                        mb: 0.5, 
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}
                                >
                                    {count}
                                </Typography>
                            )}
                            <Box
                                sx={{
                                    width: barWidth,
                                    height: `${Math.max(height, 4)}px`, // Minimum height for visibility
                                    backgroundColor: bgColor,
                                    mx: spacing,
                                    border: boxNumber === LEARNED_BOX 
                                        ? '1px dashed rgba(255, 255, 255, 0.3)' 
                                        : '1px solid rgba(255, 255, 255, 0.2)',
                                    boxSizing: 'border-box',
                                    transition: 'height 0.3s ease-in-out',
                                    opacity: 0.9,
                                    '&:hover': {
                                        opacity: 1,
                                        transform: 'translateY(-4px)',
                                        transition: 'transform 0.2s ease-out'
                                    }
                                }}
                            />
                            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                                {boxNumber}
                            </Typography>
                        </Box>
                    </Tooltip>
                );
            })}
        </Box>
    );
};

// Compact version of BoxDistributionBars for the header area
const CompactBoxDistributionBars: React.FC<{ stats: CardStats }> = ({ stats }) => {
    const maxBarHeight = 60; // pixels
    const barWidth = '24px'; 
    const spacing = '2px';
    
    if (stats.totalCards === 0) {
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: `${maxBarHeight}px` 
            }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No cards data
                </Typography>
            </Box>
        );
    }
    
    return (
        <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            height: `${maxBarHeight}px`, 
            justifyContent: 'center' 
        }}>
            {stats.boxCounts.slice(1).map((count, index) => {
                const boxNumber = index + 1;
                const percentage = stats.totalCards > 0 ? (count / stats.totalCards) * 100 : 0;
                const height = (percentage / 100) * maxBarHeight;
                const bgColor = BOX_COLORS[boxNumber] || '#eee';

                return (
                    <Tooltip 
                        key={boxNumber}
                        title={`Box ${boxNumber}${boxNumber === LEARNED_BOX ? ' (Learned)' : ''}: ${count} card${count !== 1 ? 's' : ''} (${percentage.toFixed(1)}%)`} 
                        placement="top"
                    >
                        <Box sx={{ textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: barWidth,
                                    height: `${Math.max(height, 3)}px`, // Minimum height for visibility
                                    backgroundColor: bgColor,
                                    mx: spacing,
                                    border: boxNumber === LEARNED_BOX 
                                        ? '1px dashed rgba(255, 255, 255, 0.3)' 
                                        : '1px solid rgba(255, 255, 255, 0.2)',
                                    boxSizing: 'border-box',
                                    opacity: 0.9,
                                    '&:hover': {
                                        opacity: 1,
                                        transform: 'translateY(-2px)',
                                        transition: 'transform 0.2s ease-out'
                                    }
                                }}
                            />
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                                {boxNumber}
                            </Typography>
                        </Box>
                    </Tooltip>
                );
            })}
        </Box>
    );
};

// Main component for card statistics
const CardStatisticsView: React.FC = () => {
    const { classes, studentProgress, flashcardSets } = useAppContext();
    const allStudents = classes.flatMap(cls => cls.students);
    
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [selectedStudent, setSelectedStudent] = useState<string>('all');
    const [cardLimit, setCardLimit] = useState<number>(10); // Default to showing 10 cards
    const [selectedCard, setSelectedCard] = useState<CardPerformance | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [isPressed, setIsPressed] = useState<boolean>(false);
    
    // Listen for mouseup events on the document
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isPressed) {
                setIsPressed(false);
            }
        };
        
        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('mouseleave', handleGlobalMouseUp);
        
        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('mouseleave', handleGlobalMouseUp);
        };
    }, [isPressed]);
    
    // Get students for the selected class
    const studentsInSelectedClass = useMemo(() => {
        if (selectedClass === 'all') {
            return allStudents;
        }
        const classObj = classes.find(cls => cls.id === selectedClass);
        return classObj ? classObj.students : [];
    }, [selectedClass, classes, allStudents]);
    
    // Calculate statistics
    const overallStats = useMemo(() => 
        calculateOverallStats(
            studentProgress, 
            allStudents,
            classes,
            selectedClass !== 'all' ? selectedClass : undefined
        ), 
        [studentProgress, allStudents, classes, selectedClass]
    );
    
    // Calculate individual card performance with student filter
    const cardPerformance = useMemo(() => {
        // If a specific student is selected, filter the studentProgress object
        let filteredProgress = studentProgress;
        if (selectedStudent !== 'all') {
            filteredProgress = {
                [selectedStudent]: studentProgress[selectedStudent]
            };
        }
        
        return calculateCardPerformance(
            filteredProgress, 
            flashcardSets,
            selectedClass !== 'all' ? selectedClass : undefined,
            allStudents,
            classes
        );
    }, [studentProgress, flashcardSets, selectedClass, selectedStudent, allStudents, classes]);
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };
    
    const handleClassChange = (event: SelectChangeEvent) => {
        setSelectedClass(event.target.value);
        setSelectedStudent('all'); // Reset student selection when class changes
    };
    
    const handleStudentChange = (event: SelectChangeEvent) => {
        setSelectedStudent(event.target.value);
    };
    
    const handleCardLimitChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setCardLimit(value === 'all' ? Number.MAX_SAFE_INTEGER : Number(value));
    };

    // Handle mouse down on a card
    const handleCardMouseDown = (event: React.MouseEvent<HTMLElement>, card: CardPerformance) => {
        setSelectedCard(card);
        setAnchorEl(event.currentTarget);
        setIsPressed(true);
    };
    
    // Handle mouse up on a card
    const handleCardMouseUp = () => {
        setIsPressed(false);
    };
    
    // Format percentage with 1 decimal place
    const formatPercentage = (value: number): string => {
        return `${value.toFixed(1)}%`;
    };
    
    // Determine if the popper should be open
    const open = Boolean(anchorEl) && isPressed && selectedCard !== null;
    const id = open ? 'card-detail-popper' : undefined;
    
    return (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Card Statistics Dashboard
            </Typography>
            
            {/* Compact Controls Row */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                mb: 2 
            }}>
                {/* Box Distribution Graph - takes priority */}
                <Box sx={{ 
                    flexGrow: 1, 
                    minWidth: '300px',
                    height: '80px',
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    p: 1
                }}>
                    <CompactBoxDistributionBars stats={overallStats} />
                </Box>
                
                {/* Filters - right aligned, shrink as needed */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="class-filter-label">Class</InputLabel>
                        <Select
                            labelId="class-filter-label"
                            value={selectedClass}
                            onChange={handleClassChange}
                            label="Class"
                        >
                            <MenuItem value="all">All Classes</MenuItem>
                            {classes.map(cls => (
                                <MenuItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <InputLabel id="student-filter-label">Student</InputLabel>
                        <Select
                            labelId="student-filter-label"
                            value={selectedStudent}
                            onChange={handleStudentChange}
                            label="Student"
                            disabled={studentsInSelectedClass.length === 0}
                        >
                            <MenuItem value="all">All Students</MenuItem>
                            {studentsInSelectedClass.map(student => (
                                <MenuItem key={student.id} value={student.id}>
                                    {student.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 80 }}>
                        <InputLabel id="limit-label">Show</InputLabel>
                        <Select
                            labelId="limit-label"
                            value={cardLimit === Number.MAX_SAFE_INTEGER ? 'all' : cardLimit.toString()}
                            onChange={handleCardLimitChange}
                            label="Show"
                        >
                            <MenuItem value="10">10</MenuItem>
                            <MenuItem value="20">20</MenuItem>
                            <MenuItem value="50">50</MenuItem>
                            <MenuItem value="all">All</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            
            {/* Card Performance Grid */}
            <Box sx={{ mt: 2 }}>
                {cardPerformance.length > 0 ? (
                    <Grid container spacing={1}>
                        {cardPerformance.slice(0, cardLimit).map(card => (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={card.cardId}>
                                <Box 
                                    sx={{
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        p: 1,
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: 1,
                                        height: '100%',
                                        minHeight: '120px',
                                        backgroundColor: 'background.default',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            borderColor: 'primary.main',
                                            boxShadow: '0 0 5px rgba(33, 150, 243, 0.3)'
                                        },
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none' // Prevent text selection
                                    }}
                                    onMouseDown={(e) => handleCardMouseDown(e, card)}
                                    onMouseUp={handleCardMouseUp}
                                >
                                    <Box 
                                        sx={{ 
                                            width: '100%', 
                                            height: 80, 
                                            backgroundImage: `url(${card.questionImg})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            mb: 1
                                        }}
                                    />
                                    
                                    {/* Success rate overlay in top-right corner */}
                                    <Box 
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 5, 
                                            right: 5,
                                            backgroundColor: card.successRate < 30 ? '#ff5252' : 
                                                           card.successRate < 50 ? '#ffb74d' : '#66bb6a',
                                            color: 'white',
                                            borderRadius: '4px',
                                            px: 1,
                                            py: 0.5,
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {formatPercentage(card.successRate)}
                                    </Box>
                                    
                                    <Box sx={{ mt: 'auto' }}>
                                        <Typography variant="caption" align="center" sx={{ display: 'block' }}>
                                            {card.totalAttempts} attempts
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ py: 4 }}>
                        No card performance data available
                    </Typography>
                )}
            </Box>
            
            {/* Card Detail Popper (shown while pressing on a card) */}
            <Popper 
                id={id}
                open={open}
                anchorEl={anchorEl}
                placement="auto"
                transition
                modifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -10],
                        },
                    },
                ]}
                sx={{ zIndex: 1500 }}
            >
                {({ TransitionProps }) => (
                    <Fade {...TransitionProps} timeout={200}>
                        <Paper sx={{ 
                            p: 3, 
                            width: {xs: '90vw', sm: '80vw', md: '60vw'}, 
                            maxWidth: '900px',
                            maxHeight: '90vh',
                            overflow: 'auto',
                            boxShadow: 6,
                            bgcolor: 'background.paper',
                        }}>
                            <Grid container spacing={3}>
                                {/* Question Image */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Question
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            width: '100%', 
                                            height: '300px',
                                            backgroundImage: `url(${selectedCard?.questionImg})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: 1,
                                            mb: 2
                                        }}
                                    />
                                </Grid>
                                
                                {/* Answer Image */}
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Answer
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            width: '100%', 
                                            height: '300px',
                                            backgroundImage: `url(${selectedCard?.answerImg})`,
                                            backgroundSize: 'contain',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: 1,
                                            mb: 2
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Fade>
                )}
            </Popper>
        </Paper>
    );
};

export default CardStatisticsView; 