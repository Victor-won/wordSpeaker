// 1. Define Local Storage Key
const WORDS_STORAGE_KEY = 'wordBroadcastingAppWords';

// 2. saveWordsToLocalStorage(wordsArray) function
function saveWordsToLocalStorage(wordsArray) {
    try {
        localStorage.setItem(WORDS_STORAGE_KEY, JSON.stringify(wordsArray));
        console.log("Words saved to Local Storage.");
    } catch (e) {
        console.error("Error saving words to Local Storage:", e);
        if (feedbackArea) {
            feedbackArea.textContent = "Error saving word list. Settings might not persist.";
        }
    }
}

// 3. loadWordsFromLocalStorage() function
function loadWordsFromLocalStorage() {
    try {
        const storedWords = localStorage.getItem(WORDS_STORAGE_KEY);
        if (storedWords) {
            const parsedWords = JSON.parse(storedWords);
            if (Array.isArray(parsedWords)) {
                if (parsedWords.length > 0 && parsedWords[0].text && parsedWords[0].lang) {
                    return parsedWords;
                } else if (parsedWords.length === 0) {
                    return parsedWords;
                }
            }
        }
    } catch (e) {
        console.error("Error loading or parsing words from Local Storage:", e);
    }
    return null;
}

// 4. Integrate into Script Startup
let words = [];

const defaultWords = [
    { text: 'apple', lang: 'en-US', phonetic: '/ˈæpəl/' },
    { text: 'house', lang: 'en-US', phonetic: '/haʊs/' },
    { text: 'computer', lang: 'en-US', phonetic: '/kəmˈpjuːtər/' },
    { text: 'book', lang: 'en-US', phonetic: '/bʊk/' },
    { text: 'water', lang: 'en-US', phonetic: '/ˈwɔːtər/' },
    { text: '你好', lang: 'zh-CN' },
    { text: '谢谢', lang: 'zh-CN' },
    { text: '学习', lang: 'zh-CN' },
    { text: '朋友', lang: 'zh-CN' },
    { text: '快乐', lang: 'zh-CN' },
    { text: 'Good morning, how are you?', lang: 'en-US', phonetic: '/ɡʊd ˈmɔːrnɪŋ, haʊ ɑːr juː?/' },
    { text: 'Practice makes perfect.', lang: 'en-US', phonetic: '/ˈpræktɪs meɪks ˈpɜːrfɪkt/' },
    { text: '今天天气很好。', lang: 'zh-CN' },
    { text: '我喜欢学习语言。', lang: 'zh-CN' }
];

let loadedWords = loadWordsFromLocalStorage();

if (loadedWords && Array.isArray(loadedWords) && loadedWords.length > 0) {
    words = loadedWords;
    console.log("Words loaded from Local Storage.");
} else {
    words = defaultWords;
    console.log("Using default words. Saving to Local Storage.");
    saveWordsToLocalStorage(words);
}


// Variables for dictation UI
let currentWordIndex = -1;
const wordDisplay = document.getElementById('word-display');
const playButton = document.getElementById('play-button');
const nextButton = document.getElementById('next-button');
const userInput = document.getElementById('user-input');
const checkButton = document.getElementById('check-button');
const feedbackArea = document.getElementById('feedback-area');
const phoneticDisplay = document.getElementById('phonetic-display');

let audioEnabled = false;

// DOM References for Management UI
const manageWordText = document.getElementById('manage-word-text');
const manageWordLang = document.getElementById('manage-word-lang');
const manageWordPhonetic = document.getElementById('manage-word-phonetic');
const phoneticInputContainer = document.getElementById('phonetic-input-container');
const addWordForm = document.getElementById('add-word-form');
const wordListUl = document.getElementById('word-list-ul');
// 1. Get DOM References for toggle functionality
const toggleManageButton = document.getElementById('toggle-manage-button');
const manageWordsSection = document.getElementById('manage-words-section');


// renderWordList() Function
function renderWordList() {
    if (!wordListUl) return;
    wordListUl.innerHTML = '';

    if (!words || words.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No words in the list. Add some above!';
        wordListUl.appendChild(li);
        return;
    }

    words.forEach((word, index) => {
        const li = document.createElement('li');
        let content = `${index + 1}. ${word.text} (${word.lang})`;
        if (word.phonetic) {
            content += ` [${word.phonetic}]`;
        }

        const textNode = document.createTextNode(content + " ");
        li.appendChild(textNode);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-word-btn');
        deleteButton.setAttribute('data-index', index);

        deleteButton.addEventListener('click', function() {
            const wordIndexToDelete = parseInt(this.getAttribute('data-index'), 10);

            // Optional: Add a confirmation dialog
            // if (!confirm(`Are you sure you want to delete "${words[wordIndexToDelete].text}"?`)) {
            //     return;
            // }

            if (!isNaN(wordIndexToDelete) && wordIndexToDelete >= 0 && wordIndexToDelete < words.length) {
                const deletedWordText = words[wordIndexToDelete].text;
                words.splice(wordIndexToDelete, 1);
                saveWordsToLocalStorage(words);
                renderWordList();

                console.log(`Deleted word: "${deletedWordText}" at index ${wordIndexToDelete}`);

                if (words.length === 0) {
                    currentWordIndex = -1;
                    if (wordDisplay) wordDisplay.textContent = "Word list empty.";
                    if (phoneticDisplay) phoneticDisplay.textContent = "";
                    if (feedbackArea) feedbackArea.textContent = "All words deleted. Add some words.";
                    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                } else {
                    if (currentWordIndex > wordIndexToDelete) {
                        currentWordIndex--;
                    }
                    if (currentWordIndex >= words.length) {
                         currentWordIndex = words.length -1;
                    }
                    if (currentWordIndex < 0 && words.length > 0) {
                        currentWordIndex = 0;
                    }

                    if (currentWordIndex !== -1 && words[currentWordIndex]) {
                        const currentWordObject = words[currentWordIndex];
                        if (wordDisplay) wordDisplay.textContent = currentWordObject.text;
                        if (phoneticDisplay) {
                            if (currentWordObject.lang && currentWordObject.lang.startsWith('en') && currentWordObject.phonetic) {
                                phoneticDisplay.textContent = currentWordObject.phonetic;
                            } else {
                                phoneticDisplay.textContent = '';
                            }
                        }
                    } else if (words.length > 0 && currentWordIndex === -1) {
                        currentWordIndex = 0;
                        const currentWordObject = words[currentWordIndex];
                        if (wordDisplay) wordDisplay.textContent = currentWordObject.text;
                        if (phoneticDisplay) {
                             if (currentWordObject.lang && currentWordObject.lang.startsWith('en') && currentWordObject.phonetic) {
                                phoneticDisplay.textContent = currentWordObject.phonetic;
                            } else {
                                phoneticDisplay.textContent = '';
                            }
                        }
                    }
                }
                if(feedbackArea && (feedbackArea.textContent.includes("Correct!") || feedbackArea.textContent.includes("Incorrect"))){
                    feedbackArea.textContent = "";
                }
            } else {
                console.error("Invalid index for delete:", wordIndexToDelete);
            }
        });

        li.appendChild(deleteButton);
        wordListUl.appendChild(li);
    });
}


// Toggle Phonetic Input Visibility
if (manageWordLang && phoneticInputContainer) {
    manageWordLang.addEventListener('change', () => {
        if (manageWordLang.value.startsWith('en')) {
            phoneticInputContainer.style.display = '';
        } else {
            phoneticInputContainer.style.display = 'none';
        }
    });
    manageWordLang.dispatchEvent(new Event('change'));
}

// Handle "Add Word" Form Submission
if (addWordForm) {
    addWordForm.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!manageWordText || !manageWordLang || !manageWordPhonetic) {
            console.error("Form input elements not found for adding word.");
            return;
        }

        const text = manageWordText.value.trim();
        const lang = manageWordLang.value;
        const phoneticValue = manageWordPhonetic.value.trim();

        if (!text) {
            alert('Word text cannot be empty.');
            manageWordText.focus();
            return;
        }

        const newWord = { text, lang };
        if (lang.startsWith('en') && phoneticValue) {
            newWord.phonetic = phoneticValue;
        }

        words.push(newWord);
        saveWordsToLocalStorage(words);
        renderWordList();

        if (words.length === 1) {
            currentWordIndex = 0;
            const currentWordObject = words[currentWordIndex];
            if (wordDisplay) wordDisplay.textContent = currentWordObject.text;
            if (phoneticDisplay) {
                 if (currentWordObject.lang && currentWordObject.lang.startsWith('en') && currentWordObject.phonetic) {
                    phoneticDisplay.textContent = currentWordObject.phonetic;
                } else {
                    phoneticDisplay.textContent = '';
                }
            }
            if (feedbackArea) feedbackArea.textContent = "";
        }

        manageWordText.value = '';
        if (manageWordLang.value.startsWith('en')) {
           manageWordPhonetic.value = '';
        }
        manageWordText.focus();
    });
}

// 2. Add Event Listener to toggleManageButton
if (toggleManageButton && manageWordsSection) {
    toggleManageButton.addEventListener('click', () => {
        manageWordsSection.classList.toggle('hidden');
        if (manageWordsSection.classList.contains('hidden')) {
            toggleManageButton.textContent = 'Manage Words';
        } else {
            toggleManageButton.textContent = 'Hide Management';
            renderWordList(); // Re-render the list when shown
        }
    });
}


// --- Core Dictation App Functions ---
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

    if (words.length === 0) {
        if (feedbackArea) feedbackArea.textContent = "No words to speak. Word list is empty.";
        console.warn("Speak called with empty words array.");
        return;
    }
    if (currentWordIndex < 0 || currentWordIndex >= words.length) {
        console.warn("Invalid currentWordIndex for speak():", currentWordIndex, "Words length:", words.length);
        if (words.length > 0) {
            currentWordIndex = 0;
             console.log("Attempted to reset currentWordIndex. Click Next or Play to re-sync display.");
        } else {
            if (feedbackArea) feedbackArea.textContent = "No word selected to play.";
            return;
        }
    }

    const currentWord = words[currentWordIndex];
     if (!currentWord) {
        console.error("currentWord is undefined at index:", currentWordIndex);
        if (feedbackArea) feedbackArea.textContent = "Error: Could not find word data.";
        return;
    }

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

function displayNextWord() {
    if (words.length === 0) {
        if (wordDisplay) wordDisplay.textContent = "No words in list.";
        if (phoneticDisplay) phoneticDisplay.textContent = "";
        if (userInput) userInput.value = "";
        if (feedbackArea) feedbackArea.textContent = "The word list is empty.";
        currentWordIndex = -1;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        return;
    }

    currentWordIndex++;
    if (currentWordIndex >= words.length) {
        currentWordIndex = 0;
    }
    const currentWordObject = words[currentWordIndex];

    if (!currentWordObject) {
        console.error("currentWordObject is undefined in displayNextWord at index:", currentWordIndex);
        if (wordDisplay) wordDisplay.textContent = "Error loading word.";
        if (phoneticDisplay) phoneticDisplay.textContent = "";
        return;
    }

    if (wordDisplay) wordDisplay.textContent = currentWordObject.text;

    if (phoneticDisplay) {
        if (currentWordObject.lang && currentWordObject.lang.startsWith('en') && currentWordObject.phonetic) {
            phoneticDisplay.textContent = currentWordObject.phonetic;
        } else {
            phoneticDisplay.textContent = '';
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

function checkUserInput() {
    if (words.length === 0 || currentWordIndex < 0 || currentWordIndex >= words.length) {
        if (feedbackArea) feedbackArea.textContent = "No word selected to check, or word list is empty.";
        return;
    }

    const currentWordObject = words[currentWordIndex];
    if (!currentWordObject) {
        console.error("currentWordObject is undefined in checkUserInput at index:", currentWordIndex);
        if (feedbackArea) feedbackArea.textContent = "Error: Could not find word data for checking.";
        return;
    }
    const correctAnswer = currentWordObject.text;
    const userAnswer = userInput.value.trim();

    let isCorrect = false;

    if (currentWordObject.lang && currentWordObject.lang.startsWith('en')) {
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


// Event Listeners for dictation UI
if (nextButton) {
    nextButton.addEventListener('click', displayNextWord);
}

if (playButton) {
    playButton.addEventListener('click', () => {
        if (!audioEnabled) {
            audioEnabled = true;
            if (feedbackArea) {
                const currentFeedback = feedbackArea.textContent || "";
                if (currentFeedback.startsWith("Click 'Play' to enable audio.") || currentFeedback.startsWith("Audio not enabled.")) {
                    feedbackArea.textContent = "";
                }
            }

            if ('speechSynthesis' in window) {
                try {
                    window.speechSynthesis.cancel();
                    const primeUtterance = new SpeechSynthesisUtterance(" ");
                    primeUtterance.volume = 0.01;
                    primeUtterance.pitch = 0.5;
                    primeUtterance.rate = 0.5;
                    primeUtterance.lang = 'en-US';
                    speechSynthesis.speak(primeUtterance);
                    console.log("Priming utterance attempted synchronously.");
                } catch (e) {
                    console.error("Error with priming utterance:", e);
                }
            }
            speak();
        } else {
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
        if (wordDisplay) wordDisplay.textContent = "No words loaded.";
        if (phoneticDisplay) phoneticDisplay.textContent = "";
        if (feedbackArea) feedbackArea.textContent = "Word list is empty. Add some words via 'Manage Words'.";
        console.warn("Word list is empty at initialization.");
    }
    renderWordList();
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
