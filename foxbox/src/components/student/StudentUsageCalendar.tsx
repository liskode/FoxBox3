import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';

interface StudentUsageCalendarProps {
    usageDates: string[]; // ISO date strings (YYYY-MM-DD)
    completedDates?: string[]; // ISO date strings for days with completed exercises
    partialDates?: string[]; // ISO date strings for days with partial completion
    firstActivityDate?: string; // First day the student ever practiced (ISO date)
}

const StudentUsageCalendar: React.FC<StudentUsageCalendarProps> = ({ 
    usageDates, 
    completedDates = [], 
    partialDates = [],
    firstActivityDate
}) => {
    // Generate dates for the last 30 days (in reverse order, newest first)
    const generateCalendarDates = (): string[] => {
        const dates: string[] = [];
        const today = new Date();
        
        // Generate 30 dates (newest to oldest)
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date.toISOString().split('T')[0]); // Format: YYYY-MM-DD
        }
        
        return dates;
    };
    
    const calendarDates = generateCalendarDates();
    
    // Convert date arrays to Sets for faster lookups
    const usageDatesSet = new Set(usageDates);
    const completedDatesSet = new Set(completedDates);
    const partialDatesSet = new Set(partialDates);
    
    // Determine first activity date (if not provided, use the oldest usage date)
    const firstPracticeDate = firstActivityDate || 
        (usageDates.length > 0 ? 
            usageDates.sort()[0] : 
            null);
    
    // Helper to format date for tooltip display
    const formatDateForDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    };
    
    // Determine color and tooltip text for a given date
    const getDateStatus = (dateString: string) => {
        // Check if date is before first practice
        if (firstPracticeDate && dateString < firstPracticeDate) {
            return {
                color: '#333333', // Black
                opacity: 0.5,
                status: 'Before first practice'
            };
        }
        
        // Check if completed
        if (completedDatesSet.has(dateString)) {
            return {
                color: '#4caf50', // Green
                opacity: 1,
                status: 'Completed practice'
            };
        }
        
        // Check if partial
        if (partialDatesSet.has(dateString) || usageDatesSet.has(dateString)) {
            return {
                color: '#ffeb3b', // Yellow
                opacity: 0.9,
                status: 'Partial practice'
            };
        }
        
        // No activity
        return {
            color: '#f44336', // Red
            opacity: 0.7,
            status: 'No practice'
        };
    };
    
    return (
        <Box sx={{ width: '100%' }}>
            {/* 5 rows of 6 days each for 30 days */}
            {[0, 1, 2, 3, 4].map(rowIndex => (
                <Box 
                    key={rowIndex} 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: rowIndex < 4 ? 0.5 : 0
                    }}
                >
                    {/* 6 days per row */}
                    {[0, 1, 2, 3, 4, 5].map(dayIndex => {
                        const dateIndex = rowIndex * 6 + dayIndex;
                        // Skip if out of range
                        if (dateIndex >= calendarDates.length) return null;
                        
                        const dateString = calendarDates[dateIndex];
                        const { color, opacity, status } = getDateStatus(dateString);
                        
                        return (
                            <Tooltip 
                                key={dayIndex} 
                                title={`${formatDateForDisplay(dateString)} - ${status}`}
                            >
                                <Box 
                                    sx={{ 
                                        width: 8,
                                        height: 8,
                                        backgroundColor: color,
                                        borderRadius: '2px',
                                        cursor: 'pointer',
                                        opacity,
                                    }} 
                                />
                            </Tooltip>
                        );
                    })}
                </Box>
            ))}
        </Box>
    );
};

export default StudentUsageCalendar; 