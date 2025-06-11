// 1. Word List
const words = [
    // English Words
    { text: 'apple', lang: 'en-US' },
    { text: 'house', lang: 'en-US' },
    { text: 'computer', lang: 'en-US' },
    { text: 'book', lang: 'en-US' },
    { text: 'water', lang: 'en-US' },
    // Chinese Words
    { text: '你好', lang: 'zh-CN' }, // nǐ hǎo (hello)
    { text: '谢谢', lang: 'zh-CN' }, // xièxie (thank you)
    { text: '学习', lang: 'zh-CN' }, // xuéxí (study/learn)
    { text: '朋友', lang: 'zh-CN' }, // péngyou (friend)
    { text: '快乐', lang: 'zh-CN' }, // kuàilè (happy)
    // English Sentences
    { text: 'Good morning, how are you?', lang: 'en-US' },
    { text: 'Practice makes perfect.', lang: 'en-US' },
    // Chinese Sentences
    { text: '今天天气很好。', lang: 'zh-CN' }, // Jīntiān tiānqì hěn hǎo. (The weather is very good today.)
    { text: '我喜欢学习语言。', lang: 'zh-CN' }  // Wǒ xǐhuān xuéxí yǔyán. (I like learning languages.)
];

// 2. Variables
let currentWordIndex = -1;
const wordDisplay = document.getElementById('word-display');
const playButton = document.getElementById('play-button');
const nextButton = document.getElementById('next-button');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-button');
const feedbackArea = document.getElementById('feedback-area');

// speak() function
function speak() {
    if (!('speechSynthesis' in window)) {
        console.warn("Speech synthesis not supported in this browser.");
        if (feedbackArea) {
            feedbackArea.textContent = "Sorry, your browser doesn't support speech synthesis.";
        }
        return;
    }

    if (currentWordIndex < 0 || currentWordIndex >= words.length) {
        console.warn("Invalid currentWordIndex for speak():", currentWordIndex);
        if (feedbackArea) {
            feedbackArea.textContent = "No word selected to play.";
        }
        return;
    }

    const currentWord = words[currentWordIndex];

    try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentWord.text);
        utterance.lang = currentWord.lang;

        const voices = window.speechSynthesis.getVoices();
        let targetVoice = voices.find(voice => voice.lang === currentWord.lang);

        if (!targetVoice && currentWord.lang.includes('-')) {
            const langPrefix = currentWord.lang.split('-')[0];
            targetVoice = voices.find(voice => voice.lang.startsWith(langPrefix));
        }

        if (targetVoice) {
            utterance.voice = targetVoice;
        } else {
            console.warn(`No specific voice found for lang: ${currentWord.lang}. Using default.`);
        }

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            if (feedbackArea) {
                feedbackArea.textContent = `Error speaking: ${event.error}`;
                feedbackArea.style.color = "red";
            }
        };

        window.speechSynthesis.speak(utterance);

    } catch (error) {
        console.error("Error in speak function:", error);
        if (feedbackArea) {
            feedbackArea.textContent = "An error occurred during speech synthesis.";
            feedbackArea.style.color = "red";
        }
    }
}

// displayNextWord() function
function displayNextWord() {
    currentWordIndex++;
    if (currentWordIndex >= words.length) {
        currentWordIndex = 0; // Loop through words
    }
    const currentWordObject = words[currentWordIndex];
    if (wordDisplay) wordDisplay.textContent = currentWordObject.text;

    if (userInput) userInput.value = '';

    // 3. Clear feedback on "Next"
    if (feedbackArea) {
        feedbackArea.textContent = '';
        feedbackArea.style.color = ""; // Reset color
    }
    speak();
}

// 1. checkUserInput() function (replaces previous checkInput)
function checkUserInput() {
    if (currentWordIndex < 0 || currentWordIndex >= words.length) {
        if (feedbackArea) feedbackArea.textContent = "No word selected to check.";
        return;
    }

    const currentWordObject = words[currentWordIndex];
    const correctAnswer = currentWordObject.text;
    const userAnswer = userInput.value.trim();

    let isCorrect = false;

    if (currentWordObject.lang.startsWith('en')) {
        isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    } else {
        // For Chinese and other languages, direct comparison (case-sensitive, as typical)
        isCorrect = userAnswer === correctAnswer;
    }

    if (isCorrect) {
        if (feedbackArea) {
            feedbackArea.textContent = "Correct!";
            feedbackArea.style.color = "green";
        }
    } else {
        if (feedbackArea) {
            feedbackArea.textContent = "Incorrect. Try again. The correct answer was: " + correctAnswer;
            feedbackArea.style.color = "red";
        }
    }
}


// Event Listeners
if (nextButton) {
    nextButton.addEventListener('click', displayNextWord);
}

if (playButton) {
    playButton.addEventListener('click', speak);
}

// 2. Event Listener for "Check" button
if (checkButton) {
    checkButton.addEventListener('click', checkUserInput);
}

// 4. Optional: Allow Enter key to check input
if (userInput) {
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            checkUserInput();
        }
    });
}

// Initial Word Display & App Initialization
function initializeApp() {
    if (words.length > 0) {
        displayNextWord();
    } else {
        if (wordDisplay) {
            wordDisplay.textContent = "No words loaded.";
        }
        console.warn("Word list is empty. Cannot display initial word.");
    }
}

if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        initializeApp();
    };
} else {
    initializeApp();
}
