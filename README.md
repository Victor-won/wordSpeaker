# Word Broadcasting App

A simple web application for practicing word dictation in multiple languages (English and Chinese). Users can listen to words or sentences and then type what they hear to check their accuracy.

## Features

*   **Text-to-Speech:** Words and sentences are read aloud by the browser.
*   **Multi-language Support:** Includes examples in English and Chinese. The speech synthesis will attempt to use the appropriate voice for each language.
*   **Interactive Dictation:**
    *   Display of the current word/sentence (though for true dictation, the user might rely more on audio).
    *   Input field to type the heard word/sentence.
    *   Immediate feedback on whether the input is correct or incorrect.
*   **Navigation:**
    *   "Play" button to repeat the current audio.
    *   "Next" button to move to the next word/sentence.
*   **User-Friendly Interface:** Basic styling for ease of use.

## How to Use

1.  **Open the App:**
    *   Clone this repository or download the files (`index.html`, `script.js`, `style.css`).
    *   Open the `index.html` file in a modern web browser that supports the Web Speech API (e.g., Chrome, Firefox, Edge, Safari).

2.  **Using the App:**
    *   When the page loads, the first word/sentence will be displayed and spoken automatically.
    *   Click the "Play" button to hear the current word/sentence again.
    *   Type what you hear into the input field.
    *   Click the "Check" button or press Enter to see if your answer is correct. Feedback will appear below the input field.
    *   Click the "Next" button to move to the next word/sentence. This will also be spoken automatically.

## Files

*   `index.html`: The main HTML structure of the application.
*   `script.js`: Contains the JavaScript logic for word management, speech synthesis, and user input checking.
*   `style.css`: Provides basic styling for the application.

## Future Enhancements (Optional)

*   Load words from external files (e.g., CSV, JSON).
*   Option to hide the displayed text for a true "listening-only" dictation experience.
*   More sophisticated feedback mechanisms.
*   User accounts and progress tracking.
*   Wider range of languages and voice options.
```
