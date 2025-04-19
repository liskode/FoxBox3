# FoxBox3 Project Overview

This project, FoxBox3, appears to be a web-based flashcard study application.

## Project Structure

The project is organized into the following main directories and files:

-   `.git/`: Contains Git repository metadata.
-   `flashcards/`: Stores the flashcard content as PNG image files. Filenames seem to follow a pattern like `[Topic]FC[Set]_[CardNumber][Q/R].png` (e.g., `421FC_01Q.png`). 'Q' likely represents the question side and 'R' the answer side.
-   `foxbox/`: Contains the source code for the React web application that displays the flashcards.
    -   `public/`: Holds static assets for the web app, including the main `index.html` file. This is the HTML file served to the browser. It also contains a `flashcards` subdirectory, purpose unclear without further investigation (might be related to build process or unused).
    -   `src/`: Contains the React application's TypeScript (`.tsx`) source code.
        -   `components/`: Reusable UI components.
        -   `pages/`: Components representing different application pages (e.g., `StudyPage.tsx`).
        -   `App.tsx`: The main application component, setting up routing and theme (using Material UI).
        -   `index.tsx`: The entry point that renders the React app into the DOM.
    -   `package.json`: Defines project dependencies and scripts (like `npm start`, `npm run build`).
    -   `tsconfig.json`: TypeScript configuration.
    -   `README.md`: Standard Create React App README with instructions on running/building the `foxbox` app.
-   `.gitignore`: Specifies files and directories ignored by Git.
-   `README.md`: This file (the main project README).

## Functionality

The `foxbox` web application serves as the user interface for studying the flashcards stored in the `flashcards/` directory.

-   It's built using **React** and **TypeScript**.
-   **Material UI** is used for styling and UI components.
-   **React Router** handles navigation within the application. Currently, the main route points to a `StudyPage` component, which likely implements the flashcard viewing logic.
-   Users presumably interact with this web application to view flashcard questions and reveal answers.

## How it Works (High-Level)

1.  A web server (likely the development server via `npm start` or a production build server) serves the `foxbox/public/index.html` file.
2.  This `index.html` file loads the bundled JavaScript code generated from the `foxbox/src/` directory.
3.  The React application (`App.tsx`, `index.tsx`) initializes, sets up routing, and renders the UI.
4.  The `StudyPage` component fetches or accesses the flashcard images (potentially from the `/flashcards` directory or a path configured during the build) and displays them to the user.

## HTML Files Location

The main HTML file for the web application is located at:
`foxbox/public/index.html`

This file serves as the container for the dynamically generated content produced by the React application.