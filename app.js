// ---------- Passages ----------
const PASSAGES = [
    "The deep blue ocean hides many beautiful mysteries. Bright fish swim among the coral reefs while sea turtles glide through the calm water. Gentle waves roll onto the warm sandy shore all day long. Nature provides a peaceful place where anyone can relax and clear their mind from stress.",
    "Artificial intelligence is changing the way we live and work daily. Smart devices connect our homes, while software automates repetitive tasks to save time. Learning to navigate these digital tools effectively has become an essential skill for the modern workforce. Staying adaptable is the key to thriving in this tech era.",
    "Bright red flowers bloom under the warm sun. Small yellow bees fly from plant to plant looking for sweet food. A soft wind blows through the green trees and makes the leaves dance. Spending time in a quiet garden makes people feel very happy and relaxed.",
];

// ---------- DOM references ----------
const app = document.getElementById("app");
const introScreen = document.getElementById("introScreen");
const testScreen = document.getElementById("testScreen");
const statsEl = document.getElementById("stats");
const startBtn = document.getElementById("startBtn");
const capsWarning = document.getElementById("capsWarning");

const typeBox = document.getElementById("typeBox");
const typeCard = document.getElementById("typeCard");
const hiddenInput = document.getElementById("hiddenInput");
const timeValue = document.getElementById("timeValue");
const wpmValue = document.getElementById("wpmValue");
const accuracyValue = document.getElementById("accuracyValue");
const restartBtn = document.getElementById("restartBtn");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const resultsPanel = document.getElementById("resultsPanel");
const finalWpm = document.getElementById("finalWpm");
const finalAccuracy = document.getElementById("finalAccuracy");

// ---------- State ----------
let currentText = "";
let currentIndex = 0;
let errors = 0;
let startTime = null;
let timeLimit = 30;
let timeLeft = timeLimit;
let timerInterval = null;
let isRunning = false;

// ---------- Screens ----------
function showTestScreen() {
    app.classList.remove("app--intro");   // shrinks the big header
    introScreen.classList.add("hidden");
    testScreen.classList.remove("hidden");
    statsEl.classList.remove("hidden");
    loadNewPassage();   // runs AFTER the screen is visible so focus() works
}

// ---------- Setup ----------
function loadNewPassage() {
    clearInterval(timerInterval);   // stop any timer still running (e.g. Restart mid-test)

    const randomIndex = Math.floor(Math.random() * PASSAGES.length);
    currentText = PASSAGES[randomIndex];
    currentIndex = 0;
    errors = 0;
    startTime = null;
    timeLimit = 30;
    timeLeft = timeLimit;
    timerInterval = null;
    isRunning = false;

    // reset the UI
    timeValue.textContent = timeLimit;
    wpmValue.textContent = 0;
    accuracyValue.textContent = 100;
    resultsPanel.classList.add("hidden");

    hiddenInput.disabled = false;   // must be enabled BEFORE focus()
    hiddenInput.value = "";
    hiddenInput.focus({ preventScroll: true });   // don't let the page jump when the keyboard opens

    renderText();
    typeBox.scrollTo({ top: 0, behavior: "instant" });   // back to the first line, no animation
}

function renderText() {
    typeBox.innerHTML = "";
    currentText.split("").forEach((char, index) => {
        const span = document.createElement("span");
        span.textContent = char;
        if (index === currentIndex) {
            span.classList.add("char--current");
        }
        typeBox.appendChild(span);
    });
}

// Keeps the line you're typing on as the 2nd visible line of the 4-line window.
function scrollToCurrentLine() {
    const current = typeBox.children[currentIndex];
    if (!current) return;

    const style = getComputedStyle(typeBox);
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 2;
    const row = Math.floor(current.offsetTop / lineHeight);   // which line we're on (0 = first)

    typeBox.scrollTop = Math.max(0, (row - 1) * lineHeight);
}

// ---------- Core typing logic ----------
function handleInput(e) {
    const typed = e.data;

    // Backspace / deletions / anything with no character: ignore (v1)
    if (!typed) {
        hiddenInput.value = "";
        return;
    }

    // Start the timer on the very first keystroke
    if (!isRunning) {
        isRunning = true;
        startTime = Date.now();
        startTimer();
    }

    const spans = typeBox.children;
    const expected = currentText[currentIndex];
    const span = spans[currentIndex];

    // Uncomment to debug what is being compared:
    // console.log("typed:", JSON.stringify(typed[0]), "expected:", JSON.stringify(expected));

    span.classList.remove("char--current");

    if (typed[0] === expected) {
        span.classList.add("char--correct");
    } else {
        span.classList.add("char--incorrect");
        errors++;
    }

    currentIndex++;
    hiddenInput.value = "";   // keep the input empty so e.data is all we rely on

    if (currentIndex < currentText.length) {
        spans[currentIndex].classList.add("char--current");
        scrollToCurrentLine();
        updateStats();
    } else {
        endTest();   // finished the whole passage
    }
}

// ---------- Timer ----------
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timeValue.textContent = timeLeft;
        updateStats();

        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

// ---------- Scoring ----------
function calculateWPM() {
    if (!startTime) return 0;

    const secondsElapsed = Math.max((Date.now() - startTime) / 1000, 1);
    const minutesElapsed = secondsElapsed / 60;
    const correctChars = currentIndex - errors;

    return Math.round(correctChars / 5 / minutesElapsed);
}

function calculateAccuracy() {
    if (currentIndex === 0) return 100;  
    return Math.round(((currentIndex - errors) / currentIndex) * 100);
}

function updateStats() {
    wpmValue.textContent = calculateWPM();
    accuracyValue.textContent = calculateAccuracy();
}

function endTest() {
    if (!isRunning) return;  

    clearInterval(timerInterval);
    isRunning = false;
    hiddenInput.disabled = true;

    updateStats();
    finalWpm.textContent = calculateWPM();
    finalAccuracy.textContent = calculateAccuracy();
    resultsPanel.classList.remove("hidden");
    resultsPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}


function checkCapsLock(e) {
    if (e.getModifierState) {
        capsWarning.classList.toggle("hidden", !e.getModifierState("CapsLock"));
    }
}

// ---------- Events ----------
startBtn.addEventListener("click", showTestScreen);
hiddenInput.addEventListener("input", handleInput);
hiddenInput.addEventListener("keydown", checkCapsLock);
hiddenInput.addEventListener("keyup", checkCapsLock);
typeCard.addEventListener("click", () => hiddenInput.focus({ preventScroll: true }));
restartBtn.addEventListener("click", loadNewPassage);
tryAgainBtn.addEventListener("click", loadNewPassage);

