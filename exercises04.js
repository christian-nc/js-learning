// Week 1, Day 4 - exercises (wrap-up)
// Plan and reading list: day04-plan.md
// Run with: node exercises04.js

// Setup: same as Day 3. Copy it as it is for now.
const readline = require('readline/promises');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  // ---------------------------------------------------------------
  // Exercise 1: Strings vs numbers
  // For each line, write your PREDICTION in a comment first, then run and compare.
  // I think this will return false because === checks for both value and type, and one is a string and the other is a number 
  console.log("7"=== 7); // false because === checks for both value and type, and one is a string and the other is a number
  // Prediction: I think this will return true because == does type coercion and converts the string "7" to the number 7 before comparison
  console.log("7" == 7); // true because == does type coercion and converts the string "7" to the number 7 before comparison
  // Prediction: I think this will return true because both operands are strings.
  console.log("10" < "9"); // true because strings are compared lexicographically, and "10" comes before "9" in alphabetical order
  // Prediction: I think this will return false because the string "10" is converted to the number 10 and is not less than 9
  console.log("10" < 9); // false because the string "10" is converted to number 10 and is not less than 9
  // Prediction: I think this will return false because both strings are compared lexicographically, and "10" comes before "9" in alphabetical order
  console.log(Number("10") < Number("9")); // false because both strings will be converted to numbers and 10 is not less than 9
  // Then answer in a comment: why is "10" < "9" true? avaScript compares these as strings, character by character. It compares the first character of "10" ("1") with the first character of "9" ("9"). Since "1" comes before "9" in string ordering, the result is true. It doesn't need to compare the second character.
  // when the input comes from rl.question()?


  // ---------------------------------------------------------------
  // Exercise 2: What does Number() do? it converts a value to a number and when it cannot convert it, it returns NaN.
  // Predict, then run. Use console.log(Number(...)) for each:
  console.log(Number("")); // 0        
  console.log(Number("   ")); // 0
  console.log(Number("12abc")); // NaN
  console.log(Number("1e3")); // 1000
  console.log(Number("0x10")); // 16
  console.log(Number(null)); // 0
  console.log(Number(undefined)); // NaN
  console.log(Number(true)); // 1
  console.log(Number("-5")); // -5
  console.log(Number("3.5")); // 3.5
  // Then answer in a comment: which of these would you accept as a payment amount, and which would you reject? What checks do you need besides? // I would accept 1000, 16, as payment amounts. I would reject 0, infinity, -5, 3.5, NaN and undefined. I would also check if the number is positive and not zero for a valid payment amount.
  // Number.isNaN()?


  // ---------------------------------------------------------------
  // Exercise 3: Money lab
  // 1. Print 0.1 + 0.2. Is it 0.3? Print (0.1 + 0.2 === 0.3).
  console.log(0.1 + 0.2); // 0.30000000000000004
  console.log(0.1 + 0.2 === 0.3); // false
  // 2. Print 19.99 * 3. Is the answer what you expect?
  console.log(19.99 * 3); // 59.97, Yes it is what I expect.
  console.log(1.1 * 3); // 3.3000000000000003, No it is not what I expect. 
  // 3. Do the same sum in kobo (whole numbers): 1999 * 3.
  let amt = 1999 * 3;
  console.log(amt); 
  const totalInNaira = amt / 100;
  console.log(totalInNaira.toFixed(2)); // 59.97; toFixed(2) returns a string, not a number because it formats the number to 2 decimal places for display purposes but we shouldn't assume the formatted string is still a numeric amount for later calculations. Keep your numeric representation separate from your display representation.
  //    Then convert back to naira for display only. Hint: divide, and look at toFixed(2).
  // 4. In a comment: why do payment systems store 1999 and not 19.99? // Payment systems store 1999 instead of 19.99 to avoid floating-point precision issues that can arise when dealing with decimal numbers. By storing amounts in the smallest currency unit (like kobo or cents), calculations can be done using whole numbers, which are more precise and less prone to rounding errors.


  // ---------------------------------------------------------------
  // Exercise 4: Bug hunt
  // Each program below is broken. Do NOT rewrite it. Find the bug, fix the
  // smallest thing, and write a one-line comment saying what was wrong.

  // Bug A: should print the sum of 1 to 10 (expected: 55)
  let sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += i;
  }
  console.log("Sum A:", sum); // Bug A fixed: changed i < 10 to i <= 10 to include 10 in the sum

  // Bug B: should print "Invalid amount" for bad input
  const rawAmount = "abc";
  const amount = Number(rawAmount);
  if (Number.isNaN(amount)) {
    console.log("Invalid amount");
  } else {
    console.log("Amount accepted:", amount); // Bug B fixed: changed !Number.isNaN(amount) to Number.isNaN(amount) to correctly check for invalid input
  }

  // Bug C: should count down 5, 4, 3, 2, 1 and stop
  let countdown = 5;
  while (countdown > 0) {
    console.log(countdown);
    // (run this one carefully: if it never stops, press Ctrl+C in the terminal)
    countdown--; // Bug C fixed: changed countdown++ to countdown-- to correctly decrement the countdown
  }


  // ---------------------------------------------------------------
  // Exercise 5: Guessing game, version 1, from a blank page
  // Do not open exercises03.js. Build it from memory.
  // 1. The computer picks a secret whole number from 1 to 100.
  // 2. Ask for a guess in a while loop.
  // 3. Correct guess: say so and stop the loop.
  // 4. Input that is not a whole number from 1 to 100: print a message,
  //    do not crash. Add a comment saying whether it should count as a try, and why.
  // No hints, no try limit yet. Just the loop.

  
const secretNumber = Math.floor(Math.random() * 100) + 1;
const maxTries = 7;
let tries = 0;
let guessCorrectly = false;

while (!guessCorrectly && tries < maxTries) {
  const userInput = await rl.question("Guess a number between 1 and 100: ");
  const guess = Number(userInput);

  if (!Number.isInteger(guess) || guess < 1 || guess > 100 ) {
    console.log("Enter a whole number between 1 and 100."); // Invalid input should not count as a try because the user did not make a valid guess.
    continue;
  }

  tries++;

  if (guess === secretNumber) {
    guessCorrectly = true;
  } else if (guess < secretNumber) {
    console.log("Too low!");
  } else {
    console.log("Too high!");
  }
}

if (guessCorrectly) {
    const wordTries = tries === 1 ? "try" : "tries";
        console.log(`Great job! You guessed it in ${tries} ${wordTries}.`);
    } else {
        console.log(`Game over! You reached ${maxTries} attempts. The number was ${secretNumber}`);
    }


  // ---------------------------------------------------------------
  // Exercise 6: Think (no code needed, answer in a comment)
  // The game gives 7 tries for numbers 1 to 100.
  // If each guess is "too high" or "too low", a smart player can cut the
  // remaining numbers roughly in half every time: 100 -> 50 -> 25 -> 13 -> 7 -> 4 -> 2 -> 1.
  // How many halvings until only 1 number is left? 2 **7 = 128, so 7 halvings will leave 1 number.
  // Is 7 tries fair? Seven guesses are enough for an ideal halving strategy over 100 possible numbers. 
  // However, seven random guesses are not guaranteed to find the answer
  // What would the limit be for 1 to 1000? 10 should be enough for an ideal halving strategy over 1000 possible numbers.

  rl.close(); // keep this line last, or the program will not exit
}
main();
