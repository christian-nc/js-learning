// Week 1, Day 3 - exercises
// Plan and reading list: day03-plan.md
// Run with: node exercises03.js

// Setup: this lets you ask questions in the terminal.
// Copy it as it is for now. Week 4 explains async/await properly.
const readline = require("readline/promises");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runExercises() {
  // ---------------------------------------------------------------
  // Exercise 1: Random number lab
  // Print 10 random whole numbers between 1 and 100 (including both).
  // Hints: Math.random() gives 0 up to (but never including) 1.
  //        Multiply, then use Math.floor(). What do you add to shift the range?
  // Check: run it several times. Do you ever see 0 or 101?

  for (let i = 0; i < 10; i++) {
    let number = Math.floor(Math.random() * 100) + 1;
    console.log(number);
  }

  // ---------------------------------------------------------------
  // Exercise 2: Input lab
  // Ask: "What is your name? " with await rl.question(...)
  // Then ask: "How old are you? "
  // Print both answers, and the typeof of the age.
  // Predict first: what will typeof be, and why?
  const name = await rl.question("What is your name? ");

  const age = await rl.question("How old are you? ");

  console.log("\n--- Results ---"); // --- Results ---
  console.log(`Name: ${name}`); // Name: alice
  console.log(`Age: ${age}`); // Age: 28
  console.log(`typeof age: ${typeof age}`); // typeof will be string because rl.question returns a string

  // ---------------------------------------------------------------
  // Exercise 3: Input validation
  // Ask for a number. Convert it with Number(...).
  // Print "Valid number: X" or "That is not a number".
  // Test with: 42, 3.5, -5, abc, (just press Enter), 12abc
  // Question to answer in a comment: what does Number("") give? Is that what you want? it says: That is not a number, thats what I want. I want to reject empty input, and Number("") gives 0, which is a valid number, so I need to check for empty input separately.
  // Remember your Day 2 NaN bug: NaN === NaN is false. Use Number.isNaN().

  const input = await rl.question("Please enter a number: ");
  const num = Number(input);

  if (input.trim() === "") {
    console.log("That is not a number");
  } else {
    if (Number.isNaN(num)) {
      console.log("That is not a number");
    } else {
      console.log(`Valid number: ${num}`);
    }
  }
}
async function playGame() {
  // ---------------------------------------------------------------
  // Exercise 4: Number-guessing game, version 1
  // 1. The computer picks a secret whole number from 1 to 100.
  // 2. Ask the player for a guess, in a while loop.
  // 3. If the guess is correct, say so and stop the loop.
  // 4. Reject input that is not a whole number from 1 to 100,
  //    without crashing, and without counting it as a guess (decide, and note why).
  // Hint: Number.isInteger() exists. Think about the loop condition vs break.

  // Went straight to version 2, so version 1 is not implemented here.

  // ---------------------------------------------------------------
  // Exercise 5: Version 2
  // Add: "Too high" / "Too low" hints.
  // Add: a counter of tries, and a maximum of 7 tries.
  // At the end print: "You won in N tries" or "Out of tries, the number was X".
  // Think: what are the two ways the loop can end? Is your end message right for each?

  const secretNumber = Math.floor(Math.random() * 100) + 1;

  let guessCorrectly = false;
  let guessCount = 0;
  const maxAttempts = 7;

  while (!guessCorrectly && guessCount < maxAttempts) {
    const answer = await rl.question("Guess a number? ");
    const guess = Number(answer);

    if (Number.isNaN(guess)) {
      console.log("Please enter a valid number");
    } else if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
      console.log("Enter a whole number between 1 and 100");
    } else {
      guessCount++;

      if (guess === secretNumber) {
        console.log("Correct!");
        guessCorrectly = true;
      } else if (guess < secretNumber) {
        console.log("Too low!");
      } else {
        console.log("Too high!");
      }
    }
  }

  if (guessCorrectly) {
    console.log(`Great job! You guessed it in ${guessCount} attempt(s).`);
  } else {
    console.log(
      `Game over! You reached ${maxAttempts} attempts. The number was ${secretNumber}`
    );
  }
}

// ---------------------------------------------------------------
// Exercise 6 (stretch): Play again?
// After a game ends, ask "Play again? (y/n)". Handle upper and lower case.
// Hint: you probably need a loop around the whole game.
async function main() {
  await runExercises();

  let keepPlaying = true;

  while (keepPlaying) {
    await playGame();

    const replayAnswer = await rl.question("Play again? (y/n) ");

    if (replayAnswer.trim().toLowerCase() === "y") {
      keepPlaying = true;
      console.log("Starting a new game...");
    } else {
      keepPlaying = false;
      console.log("Thanks for playing");
    }
  }

  rl.close(); // keep this line last, or the program will not exit
}

main();
