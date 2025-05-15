window.onload = function () {
    const body = document.querySelector("body");
    const toggle = document.querySelector(".toggle");
    const startbtn = document.getElementById("startbtn");

    // Dark mode toggle
    toggle.addEventListener("click", () => {
        toggle.classList.toggle("active");
        body.classList.toggle("darkMode");
    });

    // Start test button logic
    startbtn.addEventListener("click", () => {
        const selectedLevel = document.getElementById("textList").value;
        const selectedTime = document.getElementById("timeList").value;
        const isDarkMode = body.classList.contains("darkMode");

        // Convert time to seconds
        let timeInSeconds = 30;
        if (selectedTime === "1min") timeInSeconds = 60;
        else if (selectedTime === "3min") timeInSeconds = 180;

        // Open new window
        const newWindow = window.open("", "_blank");

        // Write HTML to the new window
        newWindow.document.write(`
            <html>
            <head>
                <title>TypingXpert Test</title>
                <link rel="stylesheet" href="style2.css">
                <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&family=Playwrite+AU+SA:wght@100&display=swap" rel="stylesheet">
                <style>
                    .progress-ring-circle {
                        transition: stroke-dashoffset 1s linear;
                    }
                    .restart-btn {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        padding: 10px 20px;
                        background-color: rgb(234, 154, 26);
                        color: black;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    }
                    .restart-btn:hover {
                        background-color:rgb(234, 154, 26);
                    }
                    .darkMode .restart-btn {
                        background-color: rgb(234, 154, 26);
                    }
                    #textContainer {
                        outline: none;
                    }
                </style>
            </head>
            <body class="${isDarkMode ? 'darkMode' : ''}">
                <h5>TypingXpert</h5>
                <button class="restart-btn">Restart Test</button>
                <h3>Sample text will appear here!</h3>
                <div class="wrapper">
                    <div class="container1">
                        <svg class="progress-ring" width="120" height="120">
                            <circle class="progress-ring-circle" stroke="#FFC107" stroke-width="8" fill="transparent" r="56" cx="60" cy="60" />
                        </svg>
                        <p class="numeric1">${timeInSeconds}</p> <p class="text1">seconds</p>
                    </div>
                    <div class="container2"><p class="numeric2">0</p> <p class="text2">words/min</p></div>
                    <div class="container2"><p class="numeric2">0</p> <p class="text2">chars/min</p></div>
                    <div class="container2"><p class="numeric2">0</p> <p class="text2">% accuracy</p></div>
                </div>
                <img src="images/TP1a.jpg" class="TP1">
                <div class="typing-text">
                    <p id="textContainer" class="paragraphs" tabindex="0"></p>
                </div>
                <script src="paragraphs.js"></script>
                <script>
                    // Store test parameters
                    const testParams = {
                        difficulty: "${selectedLevel}",
                        timeInSeconds: ${timeInSeconds},
                        isDarkMode: ${isDarkMode}
                    };

                    let testInstance = null;

                    function initializeTest() {
                        // Clear any existing test
                        if (testInstance) {
                            testInstance.stopTest();
                        }

                        const difficulty = testParams.difficulty;
                        const timeInSeconds = testParams.timeInSeconds;
                        const targetParagraph = paragraphs[difficulty][Math.floor(Math.random() * paragraphs[difficulty].length)];
                        const textContainer = document.getElementById("textContainer");
                        
                        // Clear previous content
                        textContainer.innerHTML = '';
                        
                        // Store words and their character positions
                        const words = [];
                        let currentWord = { start: 0, chars: [] };
                        
                        for (let i = 0; i < targetParagraph.length; i++) {
                            const span = document.createElement("span");
                            span.innerText = targetParagraph[i];
                            textContainer.appendChild(span);
                            
                            // Track word boundaries (split on spaces)
                            if (targetParagraph[i] === ' ') {
                                if (currentWord.chars.length > 0) {
                                    words.push(currentWord);
                                    currentWord = { start: i + 1, chars: [] };
                                }
                            } else {
                                currentWord.chars.push(i);
                            }
                        }
                        // Add the last word if exists
                        if (currentWord.chars.length > 0) words.push(currentWord);

                        let charIndex = 0;
                        let correctChars = 0;
                        let totalTypedChars = 0;
                        let correctWords = 0;
                        let timeLeft = timeInSeconds;
                        const totalTime = timeLeft;
                        let timerInterval;
                        let timerStarted = false;

                        const numeric1 = document.querySelector(".numeric1");
                        const circle = document.querySelector(".progress-ring-circle");
                        const stats = document.querySelectorAll(".numeric2");

                        const radius = circle.r.baseVal.value;
                        const circumference = 2 * Math.PI * radius;
                        circle.style.strokeDasharray = circumference;
                        circle.style.strokeDashoffset = 0;
                        circle.style.transform = "rotate(-0deg)";
                        circle.style.transformOrigin = "50% 50%";

                        function setProgress(percent) {
                            const offset = circumference * (percent / 100);
                            circle.style.strokeDashoffset = offset;
                        }

                        // Reset all display values
                        numeric1.textContent = timeInSeconds;
                        stats[0].textContent = "0";
                        stats[1].textContent = "0";
                        stats[2].textContent = "0";
                        setProgress(0);

                        function updateStats() {
                            // WPM is count of fully correct words (2+ chars)
                            const wpm = correctWords;
                            // CPM remains correct character count (excluding spaces)
                            const cpm = correctChars;
                            // Accuracy (excluding spaces)
                            const accuracy = totalTypedChars > 0 ? Math.round((correctChars / totalTypedChars) * 100) : 100;

                            stats[0].textContent = wpm;
                            stats[1].textContent = cpm;
                            stats[2].textContent = accuracy;
                        }

                        function startTimer() {
                            if (!timerStarted) {
                                timerStarted = true;
                                // Immediately update the timer display
                                timeLeft--;
                                numeric1.textContent = timeLeft;
                                const percentElapsed = ((totalTime - timeLeft) / totalTime) * 100;
                                setProgress(percentElapsed);
                                
                                // Then start the interval
                                timerInterval = setInterval(() => {
                                    if (timeLeft > 0) {
                                        timeLeft--;
                                        numeric1.textContent = timeLeft;
                                        const percentElapsed = ((totalTime - timeLeft) / totalTime) * 100;
                                        setProgress(percentElapsed);
                                    } else {
                                        clearInterval(timerInterval);
                                        document.removeEventListener("keydown", typingHandler);
                                        updateStats();
                                        alert("Time's up!");
                                    }
                                }, 1000);
                            }
                        }

                        function checkCompletedWords() {
                            // Check if any words were fully completed correctly
                            words.forEach(word => {
                                // Only count words with 2+ characters
                                if (word.chars.length < 2 || word.completed) return;
                                
                                const allCorrect = word.chars.every(pos => {
                                    const span = textContainer.children[pos];
                                    return span.classList.contains("correct");
                                });
                                
                                if (allCorrect) {
                                    word.completed = true;
                                    correctWords++;
                                }
                            });
                        }

                        function typingHandler(e) {
                            // Start timer on first key press (excluding modifier keys)
                            if (!timerStarted && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                                startTimer();
                            }
                            
                            const allSpans = textContainer.querySelectorAll("span");
                            const currentChar = allSpans[charIndex]?.innerText;
                            
                            if (e.key === "Backspace") {
                                if (charIndex > 0) {
                                    charIndex--;
                                    const span = allSpans[charIndex];
                                    if (currentChar !== " ") {
                                        if (span.classList.contains("correct")) correctChars--;
                                        if (span.classList.contains("correct") || span.classList.contains("incorrect")) {
                                            totalTypedChars--;
                                        }
                                        // Reset word completion if backing into a word
                                        words.forEach(word => {
                                            if (charIndex >= word.start && charIndex < word.start + word.chars.length) {
                                                word.completed = false;
                                            }
                                        });
                                    }
                                    span.classList.remove("correct", "incorrect", "active");
                                    allSpans.forEach(s => s.classList.remove("active"));
                                    allSpans[charIndex].classList.add("active");
                                }
                                updateStats();
                                return;
                            }

                            if (charIndex >= allSpans.length || e.key.length !== 1 || e.ctrlKey || e.metaKey) return;

                            if (currentChar !== " ") {
                                if (e.key === currentChar) {
                                    allSpans[charIndex].classList.add("correct");
                                    correctChars++;
                                } else {
                                    allSpans[charIndex].classList.add("incorrect");
                                }
                                totalTypedChars++;
                                
                                // Check for completed words after each correct character
                                checkCompletedWords();
                            }

                            charIndex++;

                            allSpans.forEach(s => s.classList.remove("active"));
                            if (charIndex < allSpans.length) {
                                allSpans[charIndex].classList.add("active");
                            }
                            
                            updateStats();
                        }

                        // Set up the typing handler but don't start timer yet
                        document.addEventListener("keydown", typingHandler);
                        
                        // Focus on the text container automatically
                        textContainer.focus();
                        
                        return {
                            stopTest: function() {
                                clearInterval(timerInterval);
                                document.removeEventListener("keydown", typingHandler);
                            }
                        };
                    }

                    // Initialize the test
                    testInstance = initializeTest();
                    
                    // Restart button functionality
                    document.querySelector('.restart-btn').addEventListener('click', function(e) {
                        e.preventDefault();
                        // Reinitialize test
                        testInstance = initializeTest();
                    });
                </script>
            </body>
            </html>
        `);

        newWindow.document.close();
        newWindow.focus();
    });
};