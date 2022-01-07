import { StatusCodes } from "./statuscodes.js";
import { getRandomInt, getRandomEntry } from "./utils.js";

const quizHolder = document.querySelector("[data-quiz]");
const startButton = document.querySelector("[data-start]");
const resetButton = document.querySelector("[data-reset]");
const submitButton = document.querySelector("[data-submit]");
const nextButton = document.querySelector("[data-next]");
const endButton = document.querySelector("[data-end]");
const questionEl = document.querySelector("[data-question]");
const progressScoreEl = document.querySelector("[data-progress-score]");
const resultScoreEl = document.querySelector("[data-result-score]");
const answerEls = document.querySelectorAll("[data-answer]");
const result = document.querySelector("[data-result]");
const gameResults = document.querySelector("[data-game-results]");
const resultsTable = document.querySelector("[data-results-table]");
const currentQuestionIndicatorEl = document.querySelector("[data-current]");
const questionCountEl = document.querySelector("[data-question-count]");

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
};

function generateRandomString() {
  return Math.random().toString().substring(2, 8);
}

function getRandomWrongAnswer(correctAnswerString) {
  // TODO — fake status codes to trick people

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

function resetGame() {
  showStartButton();
  hideResult();
  hideEndButton();
  hideQuiz();
  hideResetButton();
  uncheckAllAnswers();
  resetGameState();
  clearResultsTable();
  updateScore();
  initTotalQuestions();
}

function hideResult() {
  result.style.display = "none";
}

function showResult() {
  result.style.display = "block";
}

function showQuiz() {
  quizHolder.style.display = "block";
}

function hideQuiz() {
  quizHolder.style.display = "none";
}

function showStartButton() {
  startButton.style.display = "block";
}

function hideStartButton() {
  startButton.style.display = "none";
}

function showResetButton() {
  resetButton.style.display = "block";
}

function hideResetButton() {
  resetButton.style.display = "none";
}

function showNextButton() {
  nextButton.style.display = "block";
}

function hideNextButton() {
  nextButton.style.display = "none";
}

function showSubmitButton() {
  submitButton.style.display = "block";
}

function hideSubmitButton() {
  submitButton.style.display = "none";
}

function showEndButton() {
  endButton.style.display = "block";
}

function hideEndButton() {
  endButton.style.display = "none";
}

function updateScore() {
  progressScoreEl.innerText = GameState.score;
}

function resetGameState() {
  GameState.seenQuestions = [];
  GameState.question = 0;
  GameState.currentWrongAnswers = [];
  GameState.currentStatusCode = 0;
  GameState.correctAnswerString = "";
  GameState.correctAnswerRandString = "";
  GameState.score = 0;
}

function clearResultsTable() {
  resultsTable.querySelector("tbody").innerHTML = "";
}

function startGame() {
  resetGame();
  hideStartButton();
  showResetButton();
  resetGameState();
  generateQuestion();
  showQuiz();
}

function updateProgressIndicator() {
  currentQuestionIndicatorEl.textContent = GameState.question;
}

function updateGameStateProgress(userAnswerString) {
  GameState.progress[GameState.currentStatusCode] = {
    correctAnswerString: GameState.correctAnswerString,
    userAnswerString: userAnswerString,
  };
}

function initTotalQuestions() {
  questionCountEl.textContent = GameState.questionCount;
}

function getNewQuestionData() {
  // get random status code data
  const questionData = getRandomEntry(StatusCodes);
  // extract code from key
  const code = Object.keys(questionData);

  // if code has already been seen, go around again
  if (GameState.seenQuestions.includes(code[0])) {
    return getNewQuestionData();
  } else {
    // add code to GameState.seenQuestions
    GameState.seenQuestions.push(code);
    return questionData;
  }
}

function generateQuestion() {
  incrementCurrentQuestion();
  updateProgressIndicator();
  clearAnswerResults();
  uncheckAllAnswers();
  hideNextButton();
  showSubmitButton();
  updateProgressIndicator();

  // get random question data that we haven't seen before
  const questionData = getNewQuestionData();

  // extract code from key
  const code = Object.keys(questionData);

  // extract description from value
  const correctAnswer = Object.values(questionData)[0];

  // set question up
  GameState.correctAnswerString = correctAnswer;
  GameState.currentStatusCode = code;
  questionEl.innerText = code;

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
    const wrongAnswer = getRandomWrongAnswer(correctAnswer);

    // populate wrong answer DOM elements
    if (i !== randomElIndex) {
      answerEls[i].querySelector("label").textContent = `${wrongAnswer}`;

      // generate wrong answer random string to confuse hackers who view source!!
      const wrongAnswerIdentifier = generateRandomString();
      // store string in DOM on answer
      answerEls[i].dataset.answer = wrongAnswerIdentifier;
      answerEls[i].querySelector("input").dataset.identifier = wrongAnswerIdentifier;
      answerEls[i].querySelector("input").dataset.answerString = wrongAnswer;
    }
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
  const correctAnswerEl = document.querySelector(
    `[data-answer="${GameState.correctAnswerRandString}"]`
  );

  correctAnswerEl.classList = "answers__option answers__option--correct";

  for (let el of answerEls) {
    if (el.dataset.answer !== GameState.correctAnswerRandString) {
      el.classList = "answers__option answers__option--incorrect";
    }
  }
}

function drawGameResults() {
  const tableBody = resultsTable.querySelector("tbody");

  for (let i = 0; i < GameState.seenQuestions.length; i++) {
    let row = document.createElement("tr");
    let questionIndex = document.createElement("td");
    questionIndex.innerText = i + 1;
    row.append(questionIndex);

    let statusCode = document.createElement("td");
    statusCode.innerText = GameState.seenQuestions[i];
    row.append(statusCode);

    let correctAnswer = document.createElement("td");
    correctAnswer.innerText = GameState.progress[GameState.seenQuestions[i]].correctAnswerString;
    row.append(correctAnswer);

    let userAnswer = document.createElement("td");
    userAnswer.innerText = GameState.progress[GameState.seenQuestions[i]].userAnswerString;
    row.append(userAnswer);

    let result = document.createElement("td");
    result.innerText =
      GameState.progress[GameState.seenQuestions[i]].correctAnswerString ===
      GameState.progress[GameState.seenQuestions[i]].userAnswerString
        ? "✓"
        : "❌";
    row.append(result);

    tableBody.append(row);
  }
}

function endGame() {
  hideEndButton();
  hideQuiz();
  drawGameResults();
  showResult();
  resultScoreEl.textContent = `You scored ${GameState.score} out of ${GameState.questionCount}!`;
}

function submitAnswer() {
  let answerIsCorrect = false;

  // get selected answer in DOM
  const selectedInputEl = document.querySelector("input:checked");

  if (!selectedInputEl) {
    return;
  }

  const selectedAnswerString = selectedInputEl.dataset.identifier;
  const userAnswerString = selectedInputEl.dataset.answerString;

  if (selectedInputEl && selectedAnswerString === GameState.correctAnswerRandString) {
    // correct answer!
    answerIsCorrect = true;
    GameState.score += 1;
    updateScore();
  }

  updateGameStateProgress(userAnswerString);
  showAnswerResults();
  hideSubmitButton();

  if (GameState.question < GameState.questionCount) {
    showNextButton();
  } else {
    showEndButton();
  }
}

startButton.addEventListener("click", startGame);

submitButton.addEventListener("click", submitAnswer);

nextButton.addEventListener("click", generateQuestion);

resetButton.addEventListener("click", resetGame);

endButton.addEventListener("click", endGame);
