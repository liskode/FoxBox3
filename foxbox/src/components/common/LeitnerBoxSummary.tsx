import React from 'react';
import { Box, Paper, Typography, LinearProgress, Grid, Tooltip } from '@mui/material';
import { FlashCard } from '../../types/FlashCard';

interface LeitnerBoxSummaryProps {
  flashcards: FlashCard[];
}

interface BoxSummary {
  box: number;
  count: number;
  color: string;
  label: string;
  daysInterval: number;
}

const LeitnerBoxSummary: React.FC<LeitnerBoxSummaryProps> = ({ flashcards }) => {
  // Define box metadata
  const boxesMetadata: BoxSummary[] = [
    { box: 1, count: 0, color: '#f44336', label: 'Daily', daysInterval: 1 },
    { box: 2, count: 0, color: '#ff9800', label: '2 Days', daysInterval: 2 },
    { box: 3, count: 0, color: '#ffeb3b', label: '4 Days', daysInterval: 4 },
    { box: 4, count: 0, color: '#4caf50', label: '1 Week', daysInterval: 7 },
    { box: 5, count: 0, color: '#2196f3', label: '2 Weeks', daysInterval: 14 },
    { box: 6, count: 0, color: '#3f51b5', label: '1 Month', daysInterval: 30 },
    { box: 7, count: 0, color: '#9c27b0', label: '2 Months', daysInterval: 60 },
  ];

  // Count the number of cards in each box
  flashcards.forEach(card => {
    if (card.box >= 1 && card.box <= 7) {
      boxesMetadata[card.box - 1].count++;
    }
  });

  // Calculate total for percentage
  const totalCards = flashcards.length;

  return (
    <Paper sx={{ p: 2, mt: 3, mb: 3 }} elevation={3}>
      <Typography variant="h6" gutterBottom align="center">
        Leitner Box Summary
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {boxesMetadata.map((boxData) => (
          <Box key={boxData.box.toString()} sx={{ flexBasis: { xs: '100%', sm: '45%', md: '30%', lg: '22%' } }}>
            <Tooltip 
              title={`Box ${boxData.box}: Review every ${boxData.daysInterval} day${boxData.daysInterval > 1 ? 's' : ''}`} 
              arrow
            >
              <Box sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2">
                    Box {boxData.box}: {boxData.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {boxData.count} card{boxData.count !== 1 ? 's' : ''}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={totalCards > 0 ? (boxData.count / totalCards) * 100 : 0} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: boxData.color
                    }
                  }}
                />
              </Box>
            </Tooltip>
          </Box>
        ))}
      </Box>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {totalCards} card{totalCards !== 1 ? 's' : ''}
        </Typography>
      </Box>
    </Paper>
  );
};

export default LeitnerBoxSummary; 