export function getRandomInt(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export function getRandomEntry(array) {
  return array[getRandomInt(0, array.length - 1)];
}

export const goodGreetings = ["Great work!", "What a pro!", "Amazing!", "Yes!", "Woop!"];
export const badGreetings = [
  "Better luck next time!",
  "Keep trying!",
  "You'll get it next time!",
  "The best way to learn is to make mistakes!",
  "This isn't easy, stick with it!",
];
