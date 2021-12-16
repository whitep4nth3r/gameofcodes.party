import { StatusCodes } from "./statuscodes.js";
import { getRandomInt, getRandomEntry } from "./utils.js";

const quizHolder = document.querySelector("[data-quiz]");
const startButton = document.querySelector("[data-start]");
const resetButton = document.querySelector("[data-reset]");
const submitButton = document.querySelector("[data-submit]");
const questionEl = document.querySelector("[data-question]");
const scoreEl = document.querySelector("[data-score]");
const answerEls = document.querySelectorAll("[data-answer]");

const GameState = {
  current: {
    questionIndex: -1,
    wrongAnswers: [],
    correctAnswerRandString: "",
    score: 0,
  },
};

function generateRandomString() {
  return Math.random().toString().substr(2, 8);
}

function getRandomWrongAnswer(correctAnswerString) {
  // TODO — fake status codes to trick people

  const randomData = getRandomEntry(StatusCodes);
  const answerString = Object.values(randomData)[0];

  if (
    answerString !== correctAnswerString &&
    !GameState.current.wrongAnswers.includes(answerString)
  ) {
    GameState.current.wrongAnswers.push(answerString);
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
  hideQuiz();
  hideResetButton();
  uncheckAllAnswers();
  GameState.current.questionIndex = -1;
  GameState.current.wrongAnswers = [];
  GameState.current.score = 0;
  updateScore();
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

function updateScore() {
  scoreEl.innerText = GameState.current.score;
}

function startGame() {
  resetGame();
  hideStartButton();
  showResetButton();
  GameState.current.questionIndex = 0;
  generateQuestion();
  showQuiz();
}

function generateQuestion() {
  clearAnswerResults();
  // do a few things with game state

  // get random status code data
  const questionData = getRandomEntry(StatusCodes);

  // extract code from key
  const code = Object.keys(questionData);
  // extract description from value
  const correctAnswer = Object.values(questionData)[0];

  // set question up
  questionEl.innerText = code;

  // get random index to populate answer
  const randomElIndex = getRandomInt(0, answerEls.length - 1);

  // populate correct answer
  answerEls[randomElIndex].querySelector("label").textContent = `${correctAnswer}`;

  // generate correct answer random string to store in game state
  const correctAnswerIdentifier = generateRandomString();
  GameState.current.correctAnswerRandString = correctAnswerIdentifier;
  // store string in DOM on correct answer
  answerEls[randomElIndex].dataset.answer = correctAnswerIdentifier;
  answerEls[randomElIndex].querySelector("input").dataset.identifier = correctAnswerIdentifier;

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
    }
  }
}

function clearAnswerResults() {
  for (let el of answerEls) {
    el.className = "answer";
  }
}

function showAnswerResults() {
  const correctAnswerEl = document.querySelector(
    `[data-answer="${GameState.current.correctAnswerRandString}"]`,
  );

  correctAnswerEl.className = "answer__correct";

  for (let el of answerEls) {
    if (el.dataset.answer !== GameState.current.correctAnswerRandString) {
      el.className = "answer__incorrect";
    }
  }
}

function submitAnswer() {
  // get selected answer in DOM
  const selectedInputEl = document.querySelector("input:checked");

  if (!selectedInputEl) {
    return;
  }

  const selectedAnswerString = selectedInputEl.dataset.identifier;

  if (selectedInputEl && selectedAnswerString === GameState.current.correctAnswerRandString) {
    // correct answer!

    GameState.current.score += 1;
    updateScore();
  } else {
    // wrong answer!
  }

  showAnswerResults();

  // TODO show next question button
}

startButton.addEventListener("click", function () {
  startGame();
});

submitButton.addEventListener("click", function () {
  submitAnswer();
});

resetButton.addEventListener("click", function () {
  resetGame();
});
