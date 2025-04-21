import React from 'react';
import { Box } from '@mui/material';
import { REVIEW_SCHEDULE, BOX_COLORS } from '../../config/calendarConfig';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

interface DailyCalendarViewProps {
    currentDay: number; // Day index (0-63)
}

const DailyCalendarView: React.FC<DailyCalendarViewProps> = ({ currentDay }) => {
    const columnWidth = '18px';
    const columnHeight = '40px'; // Reduced height slightly

    return (
        <Box sx={{ display: 'flex', overflowX: 'auto', py: 2, border: '1px solid grey', width: '100%' }}>
            {REVIEW_SCHEDULE.map((reviewBox, index) => {
                const dayIndex = index;
                const bgColor = BOX_COLORS[reviewBox] || '#ffffff';
                const isCurrentDay = dayIndex === currentDay;

                return (
                    <Box
                        key={dayIndex}
                        sx={{
                            minWidth: columnWidth,
                            width: columnWidth,
                            height: columnHeight,
                            backgroundColor: bgColor,
                            borderRight: '1px solid #ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center', // Center the single number
                            alignItems: 'center',
                            position: 'relative',
                            boxSizing: 'border-box',
                            color: (reviewBox === 3 || reviewBox === 4 || reviewBox === 5) ? '#000000' : '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '0.9rem', // Slightly larger font
                        }}
                    >
                        {/* Only show the review box number */} 
                        <Box>{reviewBox}</Box>
                        {/* Removed bottom number (New Card Box) */}

                        {/* Current Day Indicator */}
                        {isCurrentDay && (
                            <ArrowDropDownIcon
                                sx={{
                                    position: 'absolute',
                                    bottom: '-24px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: 'primary.main',
                                    fontSize: '24px',
                                }}
                            />
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default DailyCalendarView; 