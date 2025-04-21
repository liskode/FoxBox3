import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Typography, Box, Paper, List, ListItem, Tooltip, Link } from '@mui/material';
import { Student, StudentProgress } from '../../types/models';
import { LEARNED_BOX, BOX_COLORS } from '../../config/calendarConfig';
import { useNavigate } from 'react-router-dom';

interface StudentProgressSummaryProps {
    student: Student;
    progress: StudentProgress | undefined;
}

// Vertical Bar Chart Progress component
const VerticalProgressBars: React.FC<StudentProgressSummaryProps> = ({ student, progress }) => {
    const boxCounts = Array(LEARNED_BOX + 1).fill(0);
    let totalCards = 0;

    if (progress) {
        Object.values(progress.progress).forEach(cardProgress => {
            if (cardProgress.box >= 1 && cardProgress.box <= LEARNED_BOX) {
                boxCounts[cardProgress.box]++;
            }
            totalCards++;
        });
    }

    // Add console log for debugging
    console.log(`[VerticalProgressBars] Student: ${student.name}, Box Counts:`, boxCounts.slice(1));

    const maxBarHeight = 30; // Max height for bars in pixels
    const barWidth = '10px'; // Width of each vertical bar
    const spacing = '2px'; // Spacing between bars

    // If no cards, render placeholder or nothing
    if (totalCards === 0) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'flex-end', height: `${maxBarHeight}px`, ml: 1 }}>
                 <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>No cards</Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-end', height: `${maxBarHeight}px`, ml: 1 }}>
            {boxCounts.slice(1).map((count, index) => {
                const boxNumber = index + 1;
                const percentage = totalCards > 0 ? (count / totalCards) * 100 : 0;
                const height = (percentage / 100) * maxBarHeight;
                const bgColor = BOX_COLORS[boxNumber] || '#eee'; // Use defined colors

                return (
                    <Tooltip title={`Box ${boxNumber}${boxNumber === LEARNED_BOX ? ' (Learned)' : ''}: ${count} card${count !== 1 ? 's' : ''} (${percentage.toFixed(0)}%)`} key={boxNumber} placement="top">
                        <Box
                            sx={{
                                width: barWidth,
                                height: `${height}px`,
                                backgroundColor: bgColor,
                                mr: spacing,
                                border: boxNumber === LEARNED_BOX ? '1px dashed rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.2)',
                                boxSizing: 'border-box',
                                transition: 'height 0.3s ease-in-out',
                                opacity: 0.9,
                                '&:hover': { 
                                    opacity: 1,
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        />
                    </Tooltip>
                );
            })}
        </Box>
    );
};

// Main component to display progress for all students
const TeacherProgressView: React.FC = () => {
    const { classes, getStudentProgress } = useAppContext();
    const allStudents = classes.flatMap(cls => cls.students);
    const navigate = useNavigate(); // For navigation to student pages

    if (allStudents.length === 0) {
        return <Typography>No students found in any class.</Typography>;
    }

    // Handler for student name click
    const handleStudentClick = (studentId: string) => {
        navigate(`/student/${studentId}/study`);
    };

    return (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Student Progress Overview</Typography>
            <List dense>
                {allStudents.map(student => {
                    const studentProgressData = getStudentProgress(student.id);
                    // Log the data received by TeacherProgressView
                    console.log(`[TeacherProgressView] Student: ${student.name}, Progress Data Received:`, studentProgressData ? JSON.stringify(studentProgressData.progress) : 'undefined');

                    let totalCards = 0;
                    if (studentProgressData) {
                        totalCards = Object.keys(studentProgressData.progress).length;
                    }

                    return (
                        <ListItem key={student.id} divider sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
                            {/* Container for Name and Total */}
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Link 
                                    component="button" 
                                    variant="body1" 
                                    onClick={() => handleStudentClick(student.id)}
                                    sx={{ 
                                        minWidth: '100px', 
                                        mr: 2, 
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        textDecoration: 'none',
                                        color: 'primary.main',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                            color: 'primary.light'
                                        }
                                    }}
                                >
                                    {student.name}
                                </Link>
                                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>({totalCards} cards)</Typography>
                            </Box>
                            {/* Progress Bars */}
                            <VerticalProgressBars student={student} progress={studentProgressData} />
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
};

export default TeacherProgressView; 