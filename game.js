import { StatusCodes } from "./statuscodes.js";
import { getRandomInt, getRandomEntry } from "./utils.js";

const quizHolder = document.querySelector("[data-quiz]");
const startButton = document.querySelector("[data-start]");
const resetButton = document.querySelector("[data-reset]");
const questionEl = document.querySelector("[data-question]");
const answerEls = document.querySelectorAll("[data-answer]");

const GameState = {
  current: {
    questionIndex: -1,
    wrongAnswers: [],
  },
};

function getRandomWrongAnswer(correctAnswer) {
  const randomData = getRandomEntry(StatusCodes);
  const answer = Object.values(randomData)[0];

  if (answer !== correctAnswer && !GameState.current.wrongAnswers.includes(answer)) {
    GameState.current.wrongAnswers.push(answer);
    return answer;
  } else {
    getRandomWrongAnswer(correctAnswer);
  }
}

function resetGame() {
  console.log("RESET GAME");
  showStartButton();
  hideQuiz();
  hideResetButton();
  GameState.current.questionIndex = -1;
  GameState.current.wrongAnswers = [];
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

function startGame() {
  console.log("START GAME");
  resetGame();
  hideStartButton();
  showResetButton();
  generateQuestion(0);
  showQuiz();
}

function generateQuestion(questionIndex) {
  console.log("GENERATE QUESTION");
  // do a few things with game state

  // get random status code data
  const questionData = getRandomEntry(StatusCodes);

  // extract code from key
  const code = Object.keys(questionData);
  // extract description from value
  const correctAnswer = Object.values(questionData);

  // set question up
  questionEl.innerText = code;

  // get random index to populate answer
  const randomElIndex = getRandomInt(0, answerEls.length - 1);

  // populate correct answer
  answerEls[randomElIndex].innerText = `${correctAnswer} (CORRECT)`;

  // populate rest of answer elements with random descriptions
  // make sure the random description is not correctAnswer
  for (let i = 0; i < answerEls.length; i++) {
    // get a random description
    const wrongAnswer = getRandomWrongAnswer(correctAnswer);

    // populate wrong answer DOM elements

    if (i !== randomElIndex) {
      answerEls[i].textContent = `${wrongAnswer} (WRONG)`;
    }
  }
}

startButton.addEventListener("click", function () {
  startGame();
});

resetButton.addEventListener("click", function () {
  resetGame();
});
