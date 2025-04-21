import React, { useState, useMemo } from 'react';
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
    Divider
} from '@mui/material';
import { useAppContext } from '../../context/AppContext';
import { LEARNED_BOX, BOX_COLORS } from '../../config/calendarConfig';
import { Student, CardProgress, StudentProgress, Class } from '../../types/models';
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

// Component for showing box distribution bars
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

// Main component for card statistics
const CardStatisticsView: React.FC = () => {
    const { classes, studentProgress } = useAppContext();
    const allStudents = classes.flatMap(cls => cls.students);
    
    const [selectedTab, setSelectedTab] = useState(0);
    const [selectedClass, setSelectedClass] = useState<string>('all');
    
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
    
    // Calculate stats by class for class comparison
    const statsByClass = useMemo(() => 
        calculateStatsByClass(studentProgress, classes),
        [studentProgress, classes]
    );
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
    };
    
    const handleClassChange = (event: SelectChangeEvent) => {
        setSelectedClass(event.target.value);
    };

    // Format percentage with 1 decimal place
    const formatPercentage = (value: number): string => {
        return `${value.toFixed(1)}%`;
    };
    
    return (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
                Card Statistics Dashboard
            </Typography>
            
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={selectedTab} onChange={handleTabChange} aria-label="statistics tabs">
                    <Tab label="Overview" />
                    {/* <Tab label="By Class" /> Future enhancement */}
                </Tabs>
            </Box>
            
            {selectedTab === 0 && (
                <>
                    <Box sx={{ mb: 2 }}>
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id="class-filter-label">Filter by Class</InputLabel>
                            <Select
                                labelId="class-filter-label"
                                value={selectedClass}
                                onChange={handleClassChange}
                                label="Filter by Class"
                            >
                                <MenuItem value="all">All Classes</MenuItem>
                                {classes.map(cls => (
                                    <MenuItem key={cls.id} value={cls.id}>
                                        {cls.name} ({cls.students.length} students)
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    
                    <Grid container spacing={3}>
                        {/* Stats Cards */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Success/Error Rate
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <CheckCircleOutlineIcon 
                                                sx={{ 
                                                    fontSize: 48, 
                                                    color: '#66bb6a',
                                                    mb: 1 
                                                }} 
                                            />
                                            <Typography variant="h5">
                                                {formatPercentage(overallStats.successRate)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Success Rate
                                            </Typography>
                                        </Box>
                                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                        <Box sx={{ textAlign: 'center' }}>
                                            <ErrorOutlineIcon 
                                                sx={{ 
                                                    fontSize: 48, 
                                                    color: '#ff5252',
                                                    mb: 1 
                                                }} 
                                            />
                                            <Typography variant="h5">
                                                {formatPercentage(overallStats.errorRate)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Error Rate
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Based on {overallStats.totalAttempts} total card attempts
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Summary
                                    </Typography>
                                    <Box sx={{ my: 2 }}>
                                        <Typography variant="body1">
                                            <strong>{overallStats.totalCards}</strong> total cards
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>{overallStats.boxCounts[LEARNED_BOX] || 0}</strong> cards learned 
                                            ({formatPercentage((overallStats.boxCounts[LEARNED_BOX] || 0) / overallStats.totalCards * 100)})
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>{overallStats.totalStudents}</strong> students
                                        </Typography>
                                        <Typography variant="body1">
                                            <strong>{overallStats.totalClasses}</strong> classes
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', bgcolor: 'background.paper' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Cards Per Box
                                    </Typography>
                                    {overallStats.totalCards > 0 ? (
                                        <Box sx={{ maxWidth: '100%', overflow: 'auto', mt: 1 }}>
                                            {/* Display card counts for each box */}
                                            <Typography component="div" variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                {overallStats.boxCounts.slice(1).map((count, index) => {
                                                    const boxNumber = index + 1;
                                                    return (
                                                        <Box key={boxNumber} sx={{ textAlign: 'center', px: 1 }}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Box {boxNumber}
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {count}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No card data available
                                            </Typography>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        {/* Box Distribution Chart */}
                        <Grid item xs={12}>
                            <Card sx={{ bgcolor: 'background.paper' }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Card Distribution by Box
                                    </Typography>
                                    <Box sx={{ p: 2, height: '180px' }}>
                                        <BoxDistributionBars stats={overallStats} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
            
            {/* Future enhancement: Class comparison tab */}
            {/* {selectedTab === 1 && (
                // Class comparison view would go here
            )} */}
        </Paper>
    );
};

export default CardStatisticsView; 