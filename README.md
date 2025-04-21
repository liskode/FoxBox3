# FoxBox3 - Leitner System Flashcard Application

FoxBox3 is an interactive web application designed to help students learn and review material using the Leitner spaced repetition system. The application enables teachers to assign flashcards to students and track their progress through an intuitive dashboard.

## Features

### Teacher Dashboard
- **Assignment Management**: Assign flashcard sets to entire classes
- **Student Statistics**: Track student progress with visual tools
  - Class-based statistics showing unique cards per class
  - Individual student progress bars
  - Mini calendars displaying 30-day student activity
  - Box distribution charts showing mastery progression
- **Card Statistics**: Analyze card difficulty across students

### Student Experience
- **Spaced Repetition**: Implements the Leitner system with 8 boxes
  - Cards correctly answered move to higher boxes
  - Cards incorrectly answered return to Box 1
- **Review Scheduling**: Calendar-based review system ensures students review cards at optimal intervals
- **Progress Tracking**: Students can see their progress through the system
- **Study Mode**: Interactive flashcard interface with questions and answers

## Technology Stack

- **Frontend**: React, TypeScript, Material UI
- **State Management**: React Context API
- **Routing**: React Router
- **Styling**: Material UI with custom theming

## Project Structure

The project is organized into the following main directories:

- `flashcards/`: Contains flashcard image files (questions and answers)
- `foxbox/`: React application source code
  - `src/components/`: Reusable UI components
    - `common/`: Shared components like headers
    - `student/`: Student-specific components
    - `teacher/`: Teacher dashboard components
  - `src/context/`: Application state management
  - `src/pages/`: Page components for different views
  - `src/types/`: TypeScript type definitions
  - `src/config/`: Configuration files

## Recent Improvements

- Added student usage mini-calendars with color-coded activity tracking
- Integrated statistics summary in application header
- Optimized class card calculations to count unique flashcards
- Enhanced study session tracking with partial/completed session indicators
- Fixed infinite loop issues in the student study page
- Improved image loading for flashcards

## Getting Started

1. Clone the repository
2. Navigate to the `foxbox` directory
3. Install dependencies with `npm install`
4. Start the development server with `npm start`
5. Access the application at `http://localhost:3000`

## HTML Files Location

The main HTML file for the web application is located at:
`foxbox/public/index.html`