import { StatusCodes } from "./statuscodes.js";
import { getRandomInt, getRandomEntry, goodGreetings, badGreetings } from "./utils.js";

const screenEl = document.querySelector("[data-screen]");
const initSection = document.querySelector("[data-init]");
const quizHolder = document.querySelector("[data-quiz]");
const formEl = document.querySelector("[data-form]");
const answersEl = document.querySelector("[data-answers]");
const startButton = document.querySelector("[data-start]");
const resetButton = document.querySelector("[data-reset]");
const submitButton = document.querySelector("[data-submit]");
const nextButton = document.querySelector("[data-next]");
const endButton = document.querySelector("[data-end]");
const questionEl = document.querySelector("[data-question]");
const questionHeadingEl = document.querySelector(".quiz__question");
const familyEl = document.querySelector("[data-family]");
const feedbackEl = document.querySelector("[data-feedback]");
const progressScoreEl = document.querySelector("[data-progress-score]");
const resultScoreEl = document.querySelector("[data-result-score]");
const answerEls = document.querySelectorAll("[data-answer]");
const result = document.querySelector("[data-result]");
const gameResults = document.querySelector("[data-game-results]");
const currentQuestionIndicatorEl = document.querySelector("[data-current]");
const questionCountEl = document.querySelector("[data-question-count]");
const progressBar = document.querySelector("[data-progress-bar]");
const quizInfo = document.querySelector("[data-quiz-info]");
const attractCodeEl = document.querySelector(".attract__big");

const STATUS_FAMILIES = {
  1: "Informational",
  2: "Success",
  3: "Redirection",
  4: "Client error",
  5: "Server error",
};

const CORRECT_LINES = ["Perfect! +1", "Nice shot! +1", "Combo! +1", "Critical hit! +1"];
const INCORRECT_LINES = ["Miss!", "Ouch!", "Game says no", "Not quite"];

// Example GameState

/**
  correctAnswerRandString: "12237984",
  correctAnswerString: "Created",
  currentStatusCode: "200",
  currentWrongAnswers: [...],
  progress =
    {
      [key: statuscode]: {
        correctAnswerString: "",
        userAnswerString: ""
      }
    },
  score: 0,
  seenQuestions: [201, 400],
  question: 3,
  questionCount: 10,
  answered: false,
*/

const GameState = {
  correctAnswerRandString: "",
  correctAnswerString: "",
  currentStatusCode: "",
  currentWrongAnswers: [],
  progress: {},
  score: 0,
  seenQuestions: [],
  question: 1,
  questionCount: 10,
  answered: false,
};

/* ---------- Helpers ---------- */

function generateRandomString() {
  return Math.random().toString().substring(2, 8);
}

function setShown(el, shown, display = "block") {
  el.style.display = shown ? display : "none";
}

function isShown(el) {
  return el.style.display !== "none" && el.offsetParent !== null;
}

// Re-trigger a CSS animation by removing and re-adding its class
function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

function pad(num) {
  return String(num).padStart(2, "0");
}

function setFeedback(message, state) {
  feedbackEl.textContent = message;
  feedbackEl.dataset.state = state || "";
  if (message) {
    replayAnimation(feedbackEl, "is-new");
  }
}

function shakeScreen() {
  replayAnimation(screenEl, "is-shaking");
}

/* ---------- Answers ---------- */

function getRandomWrongAnswer(correctAnswerString) {
  // TODO — fake status codes to trick people

  const randomData = getRandomEntry(StatusCodes);
  const answerString = Object.values(randomData)[0];

  if (
    answerString !== correctAnswerString &&
    !GameState.currentWrongAnswers.includes(answerString)
  ) {
    GameState.currentWrongAnswers.push(answerString);
    return answerString;
  } else {
    return getRandomWrongAnswer(correctAnswerString);
  }
}

function uncheckAllAnswers() {
  for (let el of answerEls) {
    el.querySelector("input").checked = false;
  }
}

function setAnswersLocked(locked) {
  answersEl.classList.toggle("is-locked", locked);
  for (let el of answerEls) {
    el.querySelector("input").disabled = locked;
  }
}

/* ---------- Show / hide ---------- */

function showAttract() {
  setShown(initSection, true, "flex");
  startAttractCycle();
}

function hideAttract() {
  setShown(initSection, false);
  stopAttractCycle();
}

/* ---------- Game flow ---------- */

function resetGame() {
  showAttract();
  setShown(result, false);
  setShown(endButton, false);
  setShown(quizInfo, false);
  setShown(quizHolder, false);
  setShown(resetButton, false);
  uncheckAllAnswers();
  setAnswersLocked(false);
  resetGameState();
  resetProgressBar();
  clearResultsBlock();
  updateScore();
  initTotalQuestions();
  setFeedback("");
}

function updateScore(bump = false) {
  progressScoreEl.textContent = pad(GameState.score);
  if (bump) {
    replayAnimation(progressScoreEl, "is-bumped");
  }
}

function resetGameState() {
  GameState.seenQuestions = [];
  GameState.question = 0;
  GameState.currentWrongAnswers = [];
  GameState.currentStatusCode = 0;
  GameState.correctAnswerString = "";
  GameState.correctAnswerRandString = "";
  GameState.score = 0;
  GameState.progress = {};
  GameState.answered = false;
}

function clearResultsBlock() {
  gameResults.innerHTML = "";
  resultScoreEl.innerHTML = "";
}

function startGame() {
  resetGame();
  hideAttract();
  setShown(resetButton, false);
  resetGameState();
  setUpProgressBar();
  generateQuestion();
  setShown(quizInfo, true, "grid");
  setShown(quizHolder, true);
  answerEls[0].querySelector("input").focus({ preventScroll: true });
}

/* ---------- Progress ---------- */

function resetProgressBar() {
  progressBar.innerHTML = "";
}

function setUpProgressBar() {
  progressBar.innerHTML = "";
  progressBar.style.gridTemplateColumns = `repeat(${GameState.questionCount}, 1fr)`;
  progressBar.setAttribute("aria-valuemax", GameState.questionCount);
  progressBar.setAttribute("aria-valuenow", 0);

  for (let i = 0; i < GameState.questionCount; i++) {
    const seg = document.createElement("span");
    seg.className = "hud__seg";
    progressBar.appendChild(seg);
  }
}

function updateProgressIndicator() {
  currentQuestionIndicatorEl.textContent = pad(GameState.question);

  const segs = progressBar.querySelectorAll(".hud__seg");
  segs.forEach((seg, i) => {
    seg.classList.toggle("hud__seg--current", i === GameState.question - 1 && !GameState.answered);
  });
}

function updateProgressBar(answerIsCorrect) {
  const seg = progressBar.querySelectorAll(".hud__seg")[GameState.question - 1];
  if (!seg) return;

  seg.classList.remove("hud__seg--current");
  seg.classList.add(answerIsCorrect ? "hud__seg--correct" : "hud__seg--incorrect");
  seg.title = `Question ${GameState.question} of ${GameState.questionCount} was ${
    answerIsCorrect ? "correct" : "incorrect"
  }`;
  progressBar.setAttribute("aria-valuenow", GameState.question);
}

function updateGameStateProgress(userAnswerString) {
  GameState.progress[GameState.currentStatusCode] = {
    correctAnswerString: GameState.correctAnswerString,
    userAnswerString: userAnswerString,
  };

  updateProgressBar(userAnswerString === GameState.correctAnswerString);
}

function initTotalQuestions() {
  questionCountEl.textContent = pad(GameState.questionCount);
}

/* ---------- Questions ---------- */

function getNewQuestionData() {
  // get random status code data
  const questionData = getRandomEntry(StatusCodes);
  // extract code from key
  const code = Object.keys(questionData)[0];

  // if code has already been seen, go around again
  if (GameState.seenQuestions.includes(code)) {
    return getNewQuestionData();
  } else {
    GameState.seenQuestions.push(code);
    return questionData;
  }
}

function generateQuestion() {
  GameState.answered = false;
  GameState.currentWrongAnswers = [];
  incrementCurrentQuestion();
  clearAnswerResults();
  uncheckAllAnswers();
  setAnswersLocked(false);
  setShown(nextButton, false);
  setShown(submitButton, true);
  setFeedback("");
  updateProgressIndicator();

  // get random question data that we haven't seen before
  const questionData = getNewQuestionData();

  const code = Object.keys(questionData)[0];
  const correctAnswer = Object.values(questionData)[0];

  // set question up
  GameState.correctAnswerString = correctAnswer;
  GameState.currentStatusCode = code;
  questionEl.textContent = code;

  const familyNum = code.charAt(0);
  questionHeadingEl.dataset.familyNum = familyNum;
  familyEl.textContent = STATUS_FAMILIES[familyNum] ? `${familyNum}xx ${STATUS_FAMILIES[familyNum]}` : "";

  replayAnimation(questionEl, "is-new");
  replayAnimation(answersEl, "is-new");

  // get random index to populate answer
  const randomElIndex = getRandomInt(0, answerEls.length - 1);

  // populate correct answer
  answerEls[randomElIndex].querySelector("label").textContent = `${correctAnswer}`;

  // generate correct answer random string to store in game state
  const correctAnswerIdentifier = generateRandomString();
  GameState.correctAnswerRandString = correctAnswerIdentifier;

  // store string in DOM on correct answer
  answerEls[randomElIndex].dataset.answer = correctAnswerIdentifier;
  answerEls[randomElIndex].querySelector("input").dataset.identifier = correctAnswerIdentifier;
  answerEls[randomElIndex].querySelector("input").dataset.answerString = correctAnswer;

  // populate rest of answer elements with random descriptions
  // make sure the random description is not correctAnswer
  for (let i = 0; i < answerEls.length; i++) {
    if (i === randomElIndex) continue;

    const wrongAnswer = getRandomWrongAnswer(correctAnswer);
    answerEls[i].querySelector("label").textContent = `${wrongAnswer}`;

    // generate wrong answer random string to confuse hackers who view source!!
    const wrongAnswerIdentifier = generateRandomString();
    answerEls[i].dataset.answer = wrongAnswerIdentifier;
    answerEls[i].querySelector("input").dataset.identifier = wrongAnswerIdentifier;
    answerEls[i].querySelector("input").dataset.answerString = wrongAnswer;
  }
}

function clearAnswerResults() {
  for (let el of answerEls) {
    el.className = "answers__option";
  }
}

function incrementCurrentQuestion() {
  GameState.question += 1;
}

function showAnswerResults() {
  for (let el of answerEls) {
    const isCorrect = el.dataset.answer === GameState.correctAnswerRandString;
    const isPicked = el.querySelector("input").checked;

    el.className = `answers__option ${
      isCorrect ? "answers__option--correct" : "answers__option--incorrect"
    }${isPicked ? " answers__option--picked" : ""}`;
  }
}

/* ---------- Results ---------- */

function drawGameResults() {
  GameState.seenQuestions.forEach((code, i) => {
    const entry = GameState.progress[code];
    if (!entry) return;

    const answerIsCorrect = entry.correctAnswerString === entry.userAnswerString;

    const block = document.createElement("li");
    block.className = `resultBlock ${answerIsCorrect ? "resultBlock--correct" : "resultBlock--incorrect"}`;
    block.style.animationDelay = `${i * 60}ms`;

    const codeEl = document.createElement("span");
    codeEl.className = "resultBlock__code";
    codeEl.textContent = code;
    block.append(codeEl);

    const body = document.createElement("div");
    body.className = "resultBlock__body";

    if (!answerIsCorrect) {
      const titleUserAnswer = document.createElement("p");
      titleUserAnswer.className = "resultBlock__title";
      titleUserAnswer.textContent = "You answered";
      body.append(titleUserAnswer);

      const userAnswer = document.createElement("p");
      userAnswer.className = "resultBlock__answer resultBlock__answer--incorrect";
      userAnswer.textContent = entry.userAnswerString;
      body.append(userAnswer);

      const titleCorrectAnswer = document.createElement("p");
      titleCorrectAnswer.className = "resultBlock__title";
      titleCorrectAnswer.textContent = "Correct answer";
      body.append(titleCorrectAnswer);
    }

    const correctAnswer = document.createElement("p");
    correctAnswer.className = "resultBlock__answer resultBlock__answer--correct";
    correctAnswer.textContent = entry.correctAnswerString;
    body.append(correctAnswer);

    block.append(body);

    const mark = document.createElement("span");
    mark.className = "resultBlock__mark";
    mark.textContent = answerIsCorrect ? "✓" : "✘";
    mark.setAttribute("aria-label", answerIsCorrect ? "Correct" : "Incorrect");
    block.append(mark);

    gameResults.append(block);
  });
}

function getRank(scorePercentage) {
  if (scorePercentage >= 100) return "S";
  if (scorePercentage >= 80) return "A";
  if (scorePercentage >= 60) return "B";
  if (scorePercentage >= 40) return "C";
  return "D";
}

function drawEndScore() {
  const scorePercentage = Math.floor((GameState.score / GameState.questionCount) * 100);

  const prefix =
    scorePercentage > 60 ? getRandomEntry(goodGreetings) : getRandomEntry(badGreetings);

  const rank = getRank(scorePercentage);

  resultScoreEl.innerHTML = "";

  const rankEl = document.createElement("span");
  rankEl.className = "result__rank";
  rankEl.dataset.rank = rank;
  rankEl.textContent = rank;
  rankEl.setAttribute("aria-label", `Rank ${rank}`);

  const totalEl = document.createElement("p");
  totalEl.className = "result__total";
  totalEl.textContent = `${pad(GameState.score)}/${pad(GameState.questionCount)}`;
  const pctEl = document.createElement("small");
  pctEl.textContent = `${scorePercentage}%`;
  totalEl.append(pctEl);

  const greetingEl = document.createElement("p");
  greetingEl.className = "result__greeting";
  greetingEl.textContent = `${prefix} You scored ${GameState.score} out of ${GameState.questionCount}.`;

  resultScoreEl.append(rankEl, totalEl, greetingEl);
}

function endGame() {
  setShown(endButton, false);
  setShown(quizHolder, false);
  setShown(quizInfo, false);
  drawGameResults();
  drawEndScore();
  setShown(result, true);
  setShown(resetButton, true);
  resetButton.focus({ preventScroll: true });
  screenEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function submitAnswer() {
  if (GameState.answered) return;

  const selectedInputEl = document.querySelector("input[name='answer']:checked");

  if (!selectedInputEl) {
    setFeedback("Pick an answer first!", "error");
    replayAnimation(answersEl, "is-new");
    return;
  }

  const selectedAnswerString = selectedInputEl.dataset.identifier;
  const userAnswerString = selectedInputEl.dataset.answerString;
  const answerIsCorrect = selectedAnswerString === GameState.correctAnswerRandString;

  GameState.answered = true;

  if (answerIsCorrect) {
    GameState.score += 1;
    updateScore(true);
    setFeedback(getRandomEntry(CORRECT_LINES), "correct");
  } else {
    setFeedback(`${getRandomEntry(INCORRECT_LINES)} It's "${GameState.correctAnswerString}"`, "incorrect");
    shakeScreen();
  }

  updateGameStateProgress(userAnswerString);
  showAnswerResults();
  setAnswersLocked(true);
  setShown(submitButton, false);

  if (GameState.question < GameState.questionCount) {
    setShown(nextButton, true);
    nextButton.focus({ preventScroll: true });
  } else {
    setShown(endButton, true);
    endButton.focus({ preventScroll: true });
  }
}

function goToNextQuestion() {
  generateQuestion();
  answerEls[0].querySelector("input").focus({ preventScroll: true });
}

/* ---------- Attract mode: cycle a few famous codes ---------- */

const ATTRACT_CODES = ["200", "404", "301", "418", "503", "102", "429"];
let attractIndex = 0;
let attractTimer = null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function renderAttractCode(code) {
  const family = code.charAt(0);
  attractCodeEl.style.setProperty("--code-color", `var(--family-${family})`);
  attractCodeEl.querySelectorAll("span").forEach((span, i) => {
    span.textContent = code.charAt(i);
  });
  replayAnimation(attractCodeEl, "is-flipping");
}

function startAttractCycle() {
  stopAttractCycle();
  if (prefersReducedMotion.matches) return;
  attractTimer = window.setInterval(() => {
    attractIndex = (attractIndex + 1) % ATTRACT_CODES.length;
    renderAttractCode(ATTRACT_CODES[attractIndex]);
  }, 1800);
}

function stopAttractCycle() {
  if (attractTimer) {
    window.clearInterval(attractTimer);
    attractTimer = null;
  }
}

/* ---------- Keyboard controls ---------- */

const KEY_TO_INDEX = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };

function handleKeydown(event) {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const key = event.key.toLowerCase();
  const quizActive = isShown(quizHolder);

  if (quizActive && !GameState.answered && key in KEY_TO_INDEX) {
    const target = answerEls[KEY_TO_INDEX[key]];
    if (target) {
      const input = target.querySelector("input");
      input.checked = true;
      input.focus({ preventScroll: true });
      event.preventDefault();
    }
    return;
  }

  if (key !== "enter") return;

  // Let focused buttons and links handle Enter natively
  if (event.target.closest("button, a")) return;

  if (isShown(initSection)) {
    event.preventDefault();
    startGame();
  } else if (quizActive) {
    event.preventDefault();
    if (isShown(submitButton)) submitAnswer();
    else if (isShown(nextButton)) goToNextQuestion();
    else if (isShown(endButton)) endGame();
  }
}

/* ---------- Wire up ---------- */

formEl.addEventListener("submit", (event) => event.preventDefault());
startButton.addEventListener("click", startGame);
submitButton.addEventListener("click", submitAnswer);
nextButton.addEventListener("click", goToNextQuestion);
resetButton.addEventListener("click", resetGame);
endButton.addEventListener("click", endGame);
document.addEventListener("keydown", handleKeydown);

resetGame();
