import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    Container, 
    Typography, 
    Select, 
    MenuItem, 
    Button, 
    List, 
    ListItem, 
    ListItemText, 
    Box, 
    Paper, 
    Grid, 
    SelectChangeEvent, 
    Divider, 
    Alert,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TeacherProgressView from '../../components/teacher/TeacherProgressView';
import CardStatisticsView from '../../components/teacher/CardStatisticsView';
import SchoolIcon from '@mui/icons-material/School';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import ClassIcon from '@mui/icons-material/Class';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import StudentUsageCalendar from '../../components/student/StudentUsageCalendar';

// Box colors for visualization
const BOX_COLORS: { [key: number]: string } = {
    1: '#ff9999', // Light red (Box 1)
    2: '#ffcc99', // Light orange (Box 2)
    3: '#ffff99', // Light yellow (Box 3)
    4: '#ccff99', // Light green-yellow (Box 4)
    5: '#99ff99', // Light green (Box 5)
    6: '#99ffcc', // Light mint (Box 6)
    7: '#99ccff', // Light blue (Box 7)
    8: '#9999ff'  // Light purple (Box 8 - mastered)
};

// Tab Panel component to handle tab content
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`teacher-tabpanel-${index}`}
            aria-labelledby={`teacher-tab-${index}`}
            {...other}
            style={{ paddingTop: '20px' }}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
};

const a11yProps = (index: number) => {
    return {
        id: `teacher-tab-${index}`,
        'aria-controls': `teacher-tabpanel-${index}`,
    };
};

const TeacherDashboard: React.FC = () => {
    const { flashcardSets, classes, assignSetToClass, resetAllProgress, studentProgress, getStudentProgress, getStudentUsageDates, getStudentCompletedDates, getStudentPartialDates, getStudentFirstActivityDate } = useAppContext();
    const [selectedSetId, setSelectedSetId] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [showResetAlert, setShowResetAlert] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState(0);
    const navigate = useNavigate();

    const allStudents = classes.flatMap(cls => cls.students);

    // Helper to determine if a flashcard set is assigned to a class
    const getAssignmentInfo = useMemo(() => {
        const assignments: Record<string, Record<string, { assigned: boolean, date?: Date }>> = {};
        
        // Initialize with empty assignments
        flashcardSets.forEach(set => {
            assignments[set.id] = {};
            classes.forEach(cls => {
                assignments[set.id][cls.id] = { assigned: false };
            });
        });
        
        // Check student progress to determine assignments
        Object.values(studentProgress).forEach(student => {
            // Find the class for this student
            const studentClass = classes.find(cls => 
                cls.students.some(s => s.id === student.studentId)
            );
            
            if (studentClass) {
                // Check for cards from each set in this student's progress
                flashcardSets.forEach(set => {
                    const hasCardsFromSet = Object.keys(student.progress).some(cardId => 
                        set.flashcards.some(card => card.id === cardId)
                    );
                    
                    if (hasCardsFromSet) {
                        // Get the oldest card lastReviewed date as an approximation for assignment date
                        let oldestDate: Date | undefined;
                        
                        Object.values(student.progress).forEach(cardProgress => {
                            if (set.flashcards.some(card => card.id === cardProgress.cardId) && 
                                cardProgress.lastReviewed) {
                                const reviewDate = new Date(cardProgress.lastReviewed);
                                if (!oldestDate || reviewDate < oldestDate) {
                                    oldestDate = reviewDate;
                                }
                            }
                        });
                        
                        assignments[set.id][studentClass.id] = { 
                            assigned: true,
                            date: oldestDate
                        };
                    }
                });
            }
        });
        
        return assignments;
    }, [flashcardSets, classes, studentProgress]);

    const handleAssign = () => {
        if (selectedSetId && selectedClassId) {
            assignSetToClass(selectedSetId, selectedClassId);
            alert(`Assigned set ${selectedSetId} to class ${selectedClassId}. Progress may update shortly.`);
            setSelectedSetId('');
            setSelectedClassId('');
        } else {
            alert('Please select both a flashcard set and a class.');
        }
    };

    const handleSimulate = () => {
        if (selectedStudentId) {
            navigate(`/student/${selectedStudentId}/study`);
        } else {
            alert('Please select a student to simulate.');
        }
    };

    const handleReset = () => {
        resetAllProgress();
        setShowResetAlert(true);
        setTimeout(() => setShowResetAlert(false), 3000);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {showResetAlert && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    All student progress has been reset.
                </Alert>
            )}
            <Typography variant="h4" component="h1" gutterBottom>
                Teacher Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    aria-label="teacher dashboard tabs"
                    variant="fullWidth"
                >
                    <Tab 
                        label="Cards & Classes" 
                        icon={<ClassIcon />} 
                        iconPosition="start"
                        {...a11yProps(0)} 
                    />
                    <Tab 
                        label="Student Statistics" 
                        icon={<PersonIcon />} 
                        iconPosition="start"
                        {...a11yProps(1)} 
                    />
                    <Tab 
                        label="Card Statistics" 
                        icon={<AssessmentIcon />} 
                        iconPosition="start"
                        {...a11yProps(2)} 
                    />
                </Tabs>
            </Box>

            {/* Tab 1: Cards and Classes Management */}
            <TabPanel value={activeTab} index={0}>
                <Grid container spacing={3}>
                    {/* Assignment Matrix */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Assignment Matrix</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Overview of which flashcard sets are assigned to which classes. 
                                Hover over a checkmark to see the assignment date.
                            </Typography>
                            
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Flashcard Set</TableCell>
                                            {classes.map(cls => (
                                                <TableCell key={cls.id} align="center">{cls.name}</TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {flashcardSets.map(set => (
                                            <TableRow key={set.id}>
                                                <TableCell component="th" scope="row">
                                                    {set.name} ({set.flashcards.length} cards)
                                                </TableCell>
                                                {classes.map(cls => {
                                                    const assignment = getAssignmentInfo[set.id][cls.id];
                                                    return (
                                                        <TableCell key={cls.id} align="center">
                                                            {assignment.assigned ? (
                                                                <Tooltip 
                                                                    title={assignment.date ? 
                                                                        `Assigned: ${format(new Date(assignment.date), 'PP')}` : 
                                                                        "Assigned (date unknown)"
                                                                    }
                                                                >
                                                                    <CheckCircleIcon 
                                                                        color="success" 
                                                                        sx={{ 
                                                                            cursor: 'pointer',
                                                                            fontSize: '1.2rem' 
                                                                        }} 
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <Box sx={{ 
                                                                    height: '1.2rem', 
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}>
                                                                    <Button 
                                                                        size="small" 
                                                                        sx={{ minWidth: 0, p: 0, fontSize: '0.7rem' }}
                                                                        onClick={() => {
                                                                            setSelectedSetId(set.id);
                                                                            setSelectedClassId(cls.id);
                                                                            // Scroll to assignment section
                                                                            document.getElementById('assignment-section')?.scrollIntoView({ 
                                                                                behavior: 'smooth' 
                                                                            });
                                                                        }}
                                                                    >
                                                                        Assign
                                                                    </Button>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            
                            {flashcardSets.length === 0 || classes.length === 0 ? (
                                <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                                    {flashcardSets.length === 0 ? "No flashcard sets available." : "No classes available."}
                                </Typography>
                            ) : null}
                        </Paper>
                    </Grid>
                    
                    {/* Assignment Section */}
                    <Grid item xs={12} md={4}>
                        <Paper id="assignment-section" sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Assign Flashcards</Typography>
                            <Box sx={{ mb: 2 }}>
                                <Select
                                    fullWidth
                                    value={selectedSetId}
                                    onChange={(e: SelectChangeEvent<string>) => setSelectedSetId(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select Flashcard Set</MenuItem>
                                    {flashcardSets.map(set => (
                                        <MenuItem key={set.id} value={set.id}>{set.name}</MenuItem>
                                    ))}
                                </Select>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Select
                                    fullWidth
                                    value={selectedClassId}
                                    onChange={(e: SelectChangeEvent<string>) => setSelectedClassId(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="" disabled>Select Class</MenuItem>
                                    {classes.map(cls => (
                                        <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                                    ))}
                                </Select>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleAssign}
                                disabled={!selectedSetId || !selectedClassId}
                            >
                                Assign Set to Class
                            </Button>
                        </Paper>
                    </Grid>
                    {/* Flashcard Sets List */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Available Flashcard Sets</Typography>
                            <List dense>
                                {flashcardSets.map(set => (
                                    <ListItem key={set.id}>
                                        <ListItemText primary={set.name} secondary={`${set.flashcards.length} cards`} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                    {/* Classes List */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Classes</Typography>
                            <List dense>
                                {classes.map(cls => (
                                    <ListItem key={cls.id} divider>
                                        <ListItemText
                                            primary={cls.name}
                                            secondary={`Students: ${cls.students.map(s => s.name).join(', ')}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                    
                    {/* Student Simulation and Reset Section */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h6" gutterBottom>Simulate Student View</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Select
                                            size="small"
                                            value={selectedStudentId}
                                            onChange={(e: SelectChangeEvent<string>) => setSelectedStudentId(e.target.value)}
                                            displayEmpty
                                            sx={{ minWidth: 200 }}
                                        >
                                            <MenuItem value="" disabled>Select Student</MenuItem>
                                            {allStudents.map(student => (
                                                <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>
                                            ))}
                                        </Select>
                                        <Button
                                            variant="outlined"
                                            onClick={handleSimulate}
                                            disabled={!selectedStudentId}
                                            startIcon={<PersonIcon />}
                                        >
                                            Go to Student Study Page
                                        </Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                                        <Divider sx={{ mb: 2 }} />
                                        <Typography variant="h6" gutterBottom color="error">Danger Zone</Typography>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={handleReset}
                                        >
                                            Reset All Student Progress
                                        </Button>
                                        <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>
                                            This will clear all stored progress for all students.
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            {/* Tab 2: Student Statistics */}
            <TabPanel value={activeTab} index={1}>
                {/* Class-based student statistics */}
                <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Student Statistics by Class
                    </Typography>
                    
                    {/* Class columns */}
                    <Grid container spacing={2}>
                        {classes.map(cls => {
                            // Get students in this class
                            const classStudents = cls.students;
                            
                            // Calculate class-specific metrics
                            const studentsWithProgress = classStudents.filter(student => 
                                studentProgress[student.id] && 
                                Object.keys(studentProgress[student.id].progress).length > 0
                            ).length;
                            
                            // Calculate unique cards in this class (without duplicates across students)
                            const uniqueCardIds = new Set<string>();
                            classStudents.forEach(student => {
                                const studentData = studentProgress[student.id];
                                if (studentData && studentData.progress) {
                                    // Add each card ID to the Set (duplicates are automatically removed)
                                    Object.keys(studentData.progress).forEach(cardId => {
                                        uniqueCardIds.add(cardId);
                                    });
                                }
                            });
                            const totalClassCards = uniqueCardIds.size;
                            
                            const avgCardsPerStudent = classStudents.length > 0 
                                ? (totalClassCards / classStudents.length).toFixed(1) 
                                : '0';
                            
                            // Calculate box distributions
                            const boxCounts = Array(9).fill(0); // Initialize box counts (0-8, with 0 unused)
                            
                            classStudents.forEach(student => {
                                const studentData = studentProgress[student.id];
                                if (studentData) {
                                    Object.values(studentData.progress).forEach(card => {
                                        if (card.box >= 1 && card.box <= 8) {
                                            boxCounts[card.box]++;
                                        }
                                    });
                                }
                            });
                            
                            // Calculate mastery rate (percentage of cards in box 8)
                            const totalCardsInBoxes = boxCounts.reduce((sum, count) => sum + count, 0);
                            const masteryRate = totalCardsInBoxes > 0 
                                ? ((boxCounts[8] / totalCardsInBoxes) * 100).toFixed(1) 
                                : '0';
                                
                            return (
                                <Grid item xs={12} sm={6} md={4} key={cls.id}>
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, height: '100%' }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                            {cls.name}
                                        </Typography>
                                        
                                        <Grid container spacing={1} sx={{ mb: 2 }}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Students</Typography>
                                                <Typography variant="h6">{classStudents.length}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">With Cards</Typography>
                                                <Typography variant="h6">{studentsWithProgress}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Total Cards</Typography>
                                                <Typography variant="h6">{totalClassCards}</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">Avg/Student</Typography>
                                                <Typography variant="h6">{avgCardsPerStudent}</Typography>
                                            </Grid>
                                        </Grid>
                                        
                                        <Divider sx={{ my: 1 }} />
                                        
                                        {/* Student Progress Overview for this class */}
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                                            Student Progress
                                        </Typography>
                                        
                                        {/* Student list with progress bars for this class */}
                                        <Box sx={{ maxHeight: '200px', overflowY: 'auto', mb: 2 }}>
                                            <List dense disablePadding>
                                                {classStudents.map(student => {
                                                    const studentProgressData = getStudentProgress(student.id);
                                                    let totalCards = 0;
                                                    if (studentProgressData) {
                                                        totalCards = Object.keys(studentProgressData.progress).length;
                                                    }
                                                    
                                                    // Create box counts for this student
                                                    const studentBoxCounts = Array(9).fill(0);
                                                    if (studentProgressData) {
                                                        Object.values(studentProgressData.progress).forEach((cardProgress: any) => {
                                                            if (cardProgress.box >= 1 && cardProgress.box <= 8) {
                                                                studentBoxCounts[cardProgress.box]++;
                                                            }
                                                        });
                                                    }
                                                    
                                                    return (
                                                        <ListItem 
                                                            key={student.id} 
                                                            divider 
                                                            sx={{ 
                                                                py: 0.5,
                                                                display: 'flex', 
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center' 
                                                            }}
                                                        >
                                                            {/* Student name and total */}
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Button
                                                                    size="small"
                                                                    onClick={() => navigate(`/student/${student.id}/study`)}
                                                                    sx={{ 
                                                                        p: 0,
                                                                        textTransform: 'none',
                                                                        justifyContent: 'flex-start',
                                                                        fontWeight: 'normal'
                                                                    }}
                                                                >
                                                                    {student.name}
                                                                </Button>
                                                                <Typography 
                                                                    variant="caption" 
                                                                    color="text.secondary" 
                                                                    sx={{ ml: 1 }}
                                                                >
                                                                    ({totalCards})
                                                                </Typography>
                                                            </Box>
                                                            
                                                            {/* Usage Calendar - Display small calendar for the last 21 days */}
                                                            <Box sx={{ mx: 1 }}>
                                                                <StudentUsageCalendar 
                                                                    usageDates={getStudentUsageDates(student.id)}
                                                                    completedDates={getStudentCompletedDates(student.id)}
                                                                    partialDates={getStudentPartialDates(student.id)}
                                                                    firstActivityDate={getStudentFirstActivityDate(student.id)}
                                                                />
                                                            </Box>
                                                            
                                                            {/* Progress bars */}
                                                            {totalCards > 0 ? (
                                                                <Box sx={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'flex-end', 
                                                                    height: '20px',
                                                                    justifyContent: 'space-between',
                                                                    gap: '1px',
                                                                    minWidth: '80px'
                                                                }}>
                                                                    {studentBoxCounts.slice(1).map((count, index) => {
                                                                        const boxNumber = index + 1;
                                                                        const percentage = totalCards > 0 
                                                                            ? (count / totalCards) * 100 
                                                                            : 0;
                                                                        const height = `${Math.max(4, percentage * 0.2)}px`;
                                                                        const bgColor = BOX_COLORS[boxNumber] || '#eee';
                                                                        
                                                                        return (
                                                                            <Tooltip 
                                                                                key={boxNumber}
                                                                                title={`Box ${boxNumber}: ${count} cards`}
                                                                            >
                                                                                <Box sx={{
                                                                                    width: '8px',
                                                                                    height,
                                                                                    backgroundColor: bgColor,
                                                                                    opacity: 0.8,
                                                                                    '&:hover': { opacity: 1 }
                                                                                }} />
                                                                            </Tooltip>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    No cards
                                                                </Typography>
                                                            )}
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Box>
                                        
                                        <Divider sx={{ my: 1 }} />
                                        
                                        {/* Box distribution for this class */}
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                            Box Distribution
                                        </Typography>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'flex-end', 
                                            height: '60px',
                                            mt: 1,
                                            justifyContent: 'space-between'
                                        }}>
                                            {boxCounts.slice(1).map((count, index) => {
                                                const boxNumber = index + 1;
                                                const percentage = totalCardsInBoxes > 0 
                                                    ? (count / totalCardsInBoxes) * 100 
                                                    : 0;
                                                const height = `${Math.max(4, percentage * 0.6)}px`;
                                                const bgColor = BOX_COLORS[boxNumber] || '#eee';
                                                
                                                return (
                                                    <Tooltip 
                                                        key={boxNumber}
                                                        title={`Box ${boxNumber}: ${count} cards (${percentage.toFixed(1)}%)`}
                                                    >
                                                        <Box sx={{
                                                            width: '12px',
                                                            height,
                                                            backgroundColor: bgColor,
                                                            opacity: 0.8,
                                                            '&:hover': { 
                                                                opacity: 1 
                                                            }
                                                        }} />
                                                    </Tooltip>
                                                );
                                            })}
                                        </Box>
                                        
                                        <Divider sx={{ my: 1 }} />
                                        
                                        {/* Mastery rate */}
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Mastery Rate
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {masteryRate}%
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                    
                    {classes.length === 0 && (
                        <Typography sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
                            No classes available
                        </Typography>
                    )}
                </Paper>
            </TabPanel>

            {/* Tab 3: Card Statistics */}
            <TabPanel value={activeTab} index={2}>
                <CardStatisticsView />
            </TabPanel>
        </Container>
    );
};

export default TeacherDashboard; 