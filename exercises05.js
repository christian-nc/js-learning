// Week 2, Day 1 - exercises (functions)
// Plan and reading list: day05-plan.md
// Run with: node exercises05.js

// Tiny test helper. Copy it as it is. It compares what your function
// returned with what you expected and prints PASS or FAIL.
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// ---------------------------------------------------------------
// Exercise 1: Predict, then run
// Write your PREDICTION in a comment above each console.log, then run and compare.

function noReturn(a, b) {
  const total = a + b;
}

function withReturn(a, b) {
  return a + b;
}
//undefined
console.log(noReturn(2, 3));
//5
console.log(withReturn(2, 3));
// NaN
console.log(withReturn(2));
//5
console.log(withReturn(2, 3, 4));
//"23"
console.log(withReturn("2", 3)); // This is dangerous because concatening numbers like this affects payment and can ruin the whole calculation
// Then answer in a comment: what does a function give back when it has no `return`?
// it gives back undefined
// Why is `withReturn(2)` dangerous in payment code? maybe because nan is insidious and can flow down and affect the rest of the calculations. it should be caught and stopped on time

// ---------------------------------------------------------------
// Exercise 2: Your first function
// greet(name) returns the string "Hello, <name>!"  e.g. greet("Ada") -> "Hello, Ada!"
// It must RETURN the text, not print it.

function greet(name) {
  let message = "Hello, " + name + "!";
  return message;
}

check("greet Ada", greet("Ada"), "Hello, Ada!");
check("greet Chidi", greet("Chidi"), "Hello, Chidi!");

// ---------------------------------------------------------------
// Exercise 3: isValidAmount(kobo)
// Returns true only if kobo is a positive whole number (an amount in kobo).
// Reject: 0, negatives, 3.5, NaN, Infinity, and strings like "500".
// Hint: you used Number.isInteger and Number.isFinite on Day 4. What does
// Number.isInteger already rule out? Do you need every check you first think of?
// Hint: does Number.isInteger("500") return true or false? Test it first.
// I learned that an amount above MAX_KOBO could slip through
// if I only checked that it was a safe integer and positive.
// I must also enforce the maximum allowed amount.
// Number.isSafeInteger alone does not enforce my business limit.

function isValidAmount(kobo) {
  if (typeof kobo !== "number") {
    return false;
  }

  //Maximum is N999,000,000,000 which is 99,900,000,000,000 kobo

  const MAX_KOBO = 99900000000000;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
}

check("1999 is valid", isValidAmount(1999), true);
check("0 is invalid", isValidAmount(0), false);
check("-5 is invalid", isValidAmount(-5), false);
check("3.5 is invalid", isValidAmount(3.5), false);
check("NaN is invalid", isValidAmount(NaN), false);
check("Infinity is invalid", isValidAmount(Infinity), false);
check('"500" is invalid', isValidAmount("500"), false);
check('"" is invalid', isValidAmount(""), false);
check('" 500 " is invalid', isValidAmount(" 500 "), false);
// new Number(5) is an object, not a primitive number,
// so typeof rejects it even though it contains the value 5.
check("new Number(5) is invalid", isValidAmount(new Number(5)), false);
check("just below max is valid", isValidAmount(99900000000000), true);
check("just above max is invalid", isValidAmount(99900000000001), false);

// Add 2 more checks of your own:
check("1 is valid", isValidAmount(1), true);
check("100000000000000 is invalid", isValidAmount(100000000000000), false);
// ---------------------------------------------------------------
// Exercise 4: calculateTax(kobo, ratePercent = 7.5)
// Returns the tax in kobo as a WHOLE number.
// 1. 7.5% of 10000 kobo is exactly 750. But 7.5% of 1999 is 149.925. Money cannot have
//    a fraction of a kobo, so decide how to round (look at Math.round) and write
//    a comment saying why you chose it. Who loses a tiny bit when you round?
// 2. If the rate is not given, use 7.5 (a default parameter).
// 3. If kobo is not a valid amount, what should the function do? Pick one
//    (return 0? return null? throw an error?) and write a comment explaining why. throwing an error prevents the code from failing
//    Hint: returning 0 silently could hide a bug. Think about which is safest for money.

function calculateTax(kobo, ratePercent = 7.5) {
  if (!Number.isFinite(ratePercent) || ratePercent < 0) {
    throw new Error("Invalid tax rate");
  }

  // We allow 0 kobo because calculating tax on a zero amount should just
  // return 0 tax, which is fine.
  if (kobo !== 0 && !isValidAmount(kobo)) {
    throw new Error(
      "Invalid kobo amount: must be a valid positive whole number or zero"
    );
  }

  // Using Math.round because we want kobo to the nearest whole number.
  // When the result rounds up, the payer pays slightly more and the merchant gains. When it rounds down, the merchant gets slightly less.
  const tax = Math.round((kobo * ratePercent) / 100);
  return tax;
}

check("7.5% of 10000", calculateTax(10000), 750);
check("7.5% of 1999", calculateTax(1999), 150);
check("10% of 10000", calculateTax(10000, 10), 1000);
check("0% of 10000", calculateTax(10000, 0), 0);

// Add 2 more checks of your own.
check("tax on 0 is 0", calculateTax(0), 0);
check("tax on 5000 at 10% is 500", calculateTax(5000, 10), 500);

// ---------------------------------------------------------------
// Exercise 5: formatNaira(kobo)
// Returns a display string, e.g. formatNaira(1999) -> "₦19.99", formatNaira(500000) -> "₦5000.00"
// Hint: divide by 100, then look at toFixed(2) (you used it on Day 4).
// Comment: this output is for the screen only. Why should you never do
// more calculations with the string it returns? because calculations should only be done on numbers

function formatNaira(kobo) {
  // Reuse isValidAmount so formatting follows the same amount limits.
  // Allow zero separately because isValidAmount only accepts positive amounts.
  if (kobo !== 0 && !isValidAmount(kobo)) {
    throw new Error("Invalid kobo amount for formatting");
  }

  const naira = kobo / 100;
  return "₦" + naira.toFixed(2);
}

check("1999 kobo", formatNaira(1999), "₦19.99");
check("500000 kobo", formatNaira(500000), "₦5000.00");
check("5 kobo", formatNaira(5), "₦0.05");
check("0 kobo", formatNaira(0), "₦0.00");
check("100 kobo", formatNaira(100), "₦1.00");
// Add 2 more checks of your own (try 0 and 100).
check("1 kobo", formatNaira(1), "₦0.01");
check("99 kobo", formatNaira(99), "₦0.99");
// ---------------------------------------------------------------
// Exercise 6: parseGuess(rawText)
// Take your guessing-game validation and make it a function.
// Input is the raw TEXT from readline. Return the guess as a number if it is a
// whole number from 1 to 100, otherwise return null.
// Careful: you learned that Number("") and Number("   ") are 0, and Number("1e1") is 10. // have decided that i do not want 1e1, 0x1F to count
// Hint: should you check the text before you call Number(), after, or both? yes, before.
// Hint: do you want " 42 " (spaces around it) to count? Decide, and write a comment. Yes, I do for a better user experience incase they accidentally add a space

function parseGuess(rawText) {
  if (typeof rawText !== "string") {
    return null;
  }

  const text = rawText.trim();

  if (!/^\d+$/.test(text)) {
    return null;
  }

  const guess = Number(text);
  if (Number.isInteger(guess) && guess >= 1 && guess <= 100) {
    return guess;
  }

  return null;
}

check('"42"', parseGuess("42"), 42);
check('"1"', parseGuess("1"), 1);
check('"100"', parseGuess("100"), 100);
check('""', parseGuess(""), null);
check('"   "', parseGuess("   "), null);
check('"abc"', parseGuess("abc"), null);
check('"12abc"', parseGuess("12abc"), null);
check('"3.5"', parseGuess("3.5"), null);
check('"0"', parseGuess("0"), null);
check('"101"', parseGuess("101"), null);
check('" 42 "', parseGuess(" 42 "), 42);
check('"-"', parseGuess("-"), null);

// will return null
check("1e1", parseGuess("1e1"), null);
// will return null
check("0x1F", parseGuess("0x1F"), null);
// will return null
check("+5", parseGuess("+5"), null);
// will return 42. it is a design decision to remove preceding zero
check("042", parseGuess("042"), 42);
// will return 42 cos i TRIMMED
check(" 42 ", parseGuess(" 42 "), 42);
check("undefined", parseGuess(undefined), null);
// ---------------------------------------------------------------
// Exercise 7: Think (answer in a comment, no code)
// Why do the functions above RETURN a value instead of calling console.log inside?Functions return values so other parts of the program can reuse,
//test, or store those values. For example, check() can compare the value returned by calculateTax() with the expected result.
// Hint: imagine formatNaira printing directly. Could you still put its output in an
// email, a receipt file, or a test? Could you test calculateTax with check()? If formatNaira() printed its result instead of returning it,
//I could not directly capture its formatted string to put into
//a receipt file or email. Returning the string lets me reuse it
//wherever I need it.
