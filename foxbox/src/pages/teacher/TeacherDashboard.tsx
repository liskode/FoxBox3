import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Container, Typography, Select, MenuItem, Button, List, ListItem, ListItemText, Box, Paper, Grid, SelectChangeEvent, Divider, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TeacherProgressView from '../../components/teacher/TeacherProgressView';

const TeacherDashboard: React.FC = () => {
    const { flashcardSets, classes, assignSetToClass, resetAllProgress } = useAppContext();
    const [selectedSetId, setSelectedSetId] = useState<string>('');
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [showResetAlert, setShowResetAlert] = useState<boolean>(false);
    const navigate = useNavigate();

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

    const allStudents = classes.flatMap(cls => cls.students);

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

            <Grid container spacing={3}>
                {/* Row 1: Controls and Lists */}
                <Grid item xs={12} md={4}>
                    {/* Assignment Section */}
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
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
                <Grid item xs={12} md={4}>
                     {/* Flashcard Sets List */}
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
                <Grid item xs={12} md={4}>
                    {/* Classes List */}
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

                {/* Row 2: Progress View and Simulation */}
                 <Grid item xs={12} md={8}> {/* Make Progress view wider */}
                     {/* Student Progress Overview */}
                    <TeacherProgressView />
                </Grid>
                <Grid item xs={12} md={4}>
                    {/* Student Simulation Section */}
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper', borderRadius: 2 }}>
                        <Typography variant="h6" gutterBottom>Simulate Student View</Typography>
                        <Box sx={{ mb: 2 }}>
                            <Select
                                fullWidth
                                value={selectedStudentId}
                                onChange={(e: SelectChangeEvent<string>) => setSelectedStudentId(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>Select Student</MenuItem>
                                {allStudents.map(student => (
                                    <MenuItem key={student.id} value={student.id}>{student.name}</MenuItem>
                                ))}
                            </Select>
                        </Box>
                        <Button
                            variant="outlined"
                            onClick={handleSimulate}
                            disabled={!selectedStudentId}
                            sx={{ mb: 2 }}
                        >
                            Go to Student Study Page
                        </Button>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom color="error">Danger Zone</Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleReset}
                        >
                            Reset All Student Progress
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{mt: 1}}>This will clear all stored progress for all students.</Typography>
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );
};

export default TeacherDashboard; 