// foxbox/src/config/calendarConfig.ts

// Schedule based on the image (top row)
// Represents the highest box number (1-7) due for review on that day.
// Box 1 is implicitly always included in the review.
export const REVIEW_SCHEDULE: number[] = [
    1, 2, 3, 2, 4, 2, 3, 1, 2, 3, 2, 5, 4, 3, 2, 1,
    2, 3, 2, 4, 2, 3, 2, 6, 2, 3, 2, 5, 4, 3, 2, 1,
    2, 3, 2, 4, 2, 3, 2, 1, 2, 3, 2, 5, 4, 3, 2, 1,
    2, 3, 2, 4, 2, 3, 2, 7, 2, 3, 2, 6, 5, 4, 3, 2
];

// Removed NEW_CARD_SCHEDULE

// Colors matching the provided calendar image + Box 8
export const BOX_COLORS: { [key: number]: string } = {
    1: '#ff5252', // Brighter Red
    2: '#ffb74d', // Brighter Orange
    3: '#ffee58', // Brighter Yellow
    4: '#66bb6a', // Brighter Green
    5: '#4fc3f7', // Brighter Cyan/Blue
    6: '#ba68c8', // Brighter Purple/Violet
    7: '#ec407a', // Brighter Pink/Magenta
    8: '#9e9e9e', // Lighter Grey (Learned)
};

export const CALENDAR_LENGTH = 64;
// Max active review box according to schedule is 7, box 8 is learned
export const MAX_ACTIVE_BOX = 7; 
export const LEARNED_BOX = 8; 