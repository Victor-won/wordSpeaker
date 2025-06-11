// Word List
const words = [
    // English Words
    { text: 'apple', lang: 'en-US', phonetic: '/ˈæpəl/' },
    { text: 'house', lang: 'en-US', phonetic: '/haʊs/' },
    { text: 'computer', lang: 'en-US', phonetic: '/kəmˈpjuːtər/' },
    { text: 'book', lang: 'en-US', phonetic: '/bʊk/' },
    { text: 'water', lang: 'en-US', phonetic: '/ˈwɔːtər/' },
    // Chinese Words
    { text: '你好', lang: 'zh-CN' }, // nǐ hǎo (hello)
    { text: '谢谢', lang: 'zh-CN' }, // xièxie (thank you)
    { text: '学习', lang: 'zh-CN' }, // xuéxí (study/learn)
    { text: '朋友', lang: 'zh-CN' }, // péngyou (friend)
    { text: '快乐', lang: 'zh-CN' }, // kuàilè (happy)
    // English Sentences
    { text: 'Good morning, how are you?', lang: 'en-US', phonetic: '/ɡʊd ˈmɔːrnɪŋ, haʊ ɑːr juː?/' },
    { text: 'Practice makes perfect.', lang: 'en-US', phonetic: '/ˈpræktɪs meɪks ˈpɜːrfɪkt/' },
    // Chinese Sentences
    { text: '今天天气很好。', lang: 'zh-CN' }, // Jīntiān tiānqì hěn hǎo. (The weather is very good today.)
    { text: '我喜欢学习语言。', lang: 'zh-CN' }  // Wǒ xǐhuān xuéxí yǔyán. (I like learning languages.)
];

// Variables
let currentWordIndex = -1;
const wordDisplay = document.getElementById('word-display');
const playButton = document.getElementById('play-button');
const nextButton = document.getElementById('next-button');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-button');
const feedbackArea = document.getElementById('feedback-area');
const phoneticDisplay = document.getElementById('phonetic-display'); // 1. Get DOM reference

let audioEnabled = false;

// speak() function
function speak() {
    if (!audioEnabled) {
        if (feedbackArea) {
            const currentFeedback = feedbackArea.textContent || "";
            if (!currentFeedback.includes("Correct!") && !currentFeedback.includes("Incorrect")) {
                 feedbackArea.textContent = "Click 'Play' to enable audio.";
            }
        }
        return;
    }

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
        // Cancel any speech that might be ongoing from a previous rapid click,
        // especially if the priming utterance was very short or didn't play.
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

    // 2. Update displayNextWord() function
    if (phoneticDisplay) { // Check if the element exists
        if (currentWordObject.lang && currentWordObject.lang.startsWith('en') && currentWordObject.phonetic) {
            phoneticDisplay.textContent = currentWordObject.phonetic;
        } else {
            phoneticDisplay.textContent = ''; // Clear for non-English words or if no phonetic info
        }
    }

    if (userInput) userInput.value = '';

    if (feedbackArea) {
        const currentFeedback = feedbackArea.textContent || "";
        if (audioEnabled || (!audioEnabled && !currentFeedback.startsWith("Click 'Play' to enable audio."))) {
            feedbackArea.textContent = '';
            feedbackArea.style.color = "";
        }
    }
    speak();
}

// checkUserInput() function
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
    playButton.addEventListener('click', () => {
        if (!audioEnabled) {
            audioEnabled = true;
            if (feedbackArea) {
                const currentFeedback = feedbackArea.textContent || "";
                // Clear the "Click 'Play' to enable audio." or similar messages
                if (currentFeedback.startsWith("Click 'Play' to enable audio.") || currentFeedback.startsWith("Audio not enabled.")) {
                    feedbackArea.textContent = "";
                }
            }

            if ('speechSynthesis' in window) {
                try {
                    // Cancel any existing speech *before* the priming utterance.
                    // This is important if the user clicks rapidly.
                    window.speechSynthesis.cancel();
                    const primeUtterance = new SpeechSynthesisUtterance(" ");
                    primeUtterance.volume = 0.01;
                    primeUtterance.pitch = 0.5;
                    primeUtterance.rate = 0.5;
                    primeUtterance.lang = 'en-US';
                    // Remove any onend/onerror handlers from primeUtterance that call the main speak().
                    speechSynthesis.speak(primeUtterance);
                    console.log("Priming utterance attempted synchronously.");
                } catch (e) {
                    console.error("Error with priming utterance:", e);
                }
            }
            // Call the main speak() function immediately and synchronously after attempting the prime.
            speak();
        } else {
            // If audio was already enabled, just call speak.
            // Ensure any previous utterance is cancelled before speaking again if user clicks rapidly.
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            speak();
        }
    });
}

if (checkButton) {
    checkButton.addEventListener('click', checkUserInput);
}

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

if ('speechSynthesis' in window) {
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
            window.speechSynthesis.onvoiceschanged = null;
            initializeApp();
        };
    } else {
        initializeApp();
    }
} else {
    initializeApp();
}
