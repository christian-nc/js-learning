// Week 2, Day 2 - exercises (arrow functions and scope)
// Plan and reading list: day06-plan.md
// Run with: node exercises06.js

// Same helper as Day 1. It uses === on purpose (no type coercion).
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// ---------------------------------------------------------------
// Exercise 1: Predict, then run (scope puzzles)
// Write your PREDICTION in a comment above each console.log, then run and compare.
// After each one, write one sentence: WHY?

const rate = 7.5;

function showRate() {
  const rate = 10;
  return rate;
}

//10 : an inner variable with the same name takes precedence in the inner scope
console.log(showRate());
//7.5 : Available outside the function and visible to code inside the same file
console.log(rate);

if (true) {
  let insideBlock = "hello";
  var leaky = "world";
}
// undefined : let is blockscoped and in this case, block scoped to the if statement meaning insideBlock cannot be reached outside that block
console.log(typeof insideBlock);
// string : var is function-scoped and due to the fact that this code is not inside a function, leaky can be reached outside the if block.
console.log(typeof leaky);

const prices = [100, 200];
// allowed because it modified the existing array
prices.push(300);
console.log(prices.length);
// prices = [1];   // TypeError because it is trying to assign a different array to the same variable.
// Can you do `prices = [1]` ? Predict, then try it (put it in a comment if it throws).
// What is the difference between "the variable can't change" and "the contents can't change"? const prevents you from assigning a different value to the variable. It does not make an array or object unchangeable

function outer() {
  const secret = 42;
  function inner() {
    return secret + 1;
  }
  return inner();
}
console.log(outer());
// it will throw a reference error because const secret = 42 is declared inside outer() function and not seen from global scope
//console.log(secret); // Predict what this does if you un-comment it. Then try it.

// ---------------------------------------------------------------
// Exercise 2: One function, three syntaxes
// Write double(n), which returns n * 2, three ways.

// a) function declaration

console.log(doubleA(10)); // calling it before its declaration

function doubleA(n) {
  return n * 2;
}

// b) function expression: const doubleB = function (n) { ... };
const doubleB = function (n) {
  return n * 2;
};

// c) arrow function, short form, one line
const doubleC = (n) => n * 2;

check("double a", doubleA(4), 8);
check("double b", doubleB(4), 8);
check("double c", doubleC(4), 8);

// Question (comment): which of the three can you call BEFORE the line where it is defined? Test it.
// Answer: function declaration. It can be called before its declaration in the same scope.

// ---------------------------------------------------------------
// Exercise 3: Rewrite yesterday's functions as arrows
// Copy isValidAmount, calculateTax and formatNaira from exercises05.js and
// rewrite them as arrow functions. Keep the same behaviour and the same tests.
// Hint: only one-line bodies can skip `return` and `{ }`. If you need `if` or
// `throw`, you need a block body with an explicit `return`.
// Hint: Day 1 review point 2. "Zero is allowed" appears twice. Put that rule in
// ONE small helper (for example isValidAmountOrZero) and use it in both.
// Decide: should the helper live in this file or be imported? (Imports come in Week 3, so copy for now.)

const MAX_KOBO = 99900000000000;
const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

const isValidAmountOrZero = (kobo) => {
  return kobo === 0 || isValidAmount(kobo);
};

const calculateTax = (kobo, ratePercent = 7.5) => {
  if (!Number.isFinite(ratePercent) || ratePercent < 0) {
    throw new Error("Invalid tax rate");
  }
  if (!isValidAmountOrZero(kobo)) {
    throw new Error(
      "Invalid kobo amount: must be a valid positive whole number or zero"
    );
  }
  const tax = Math.round((kobo * ratePercent) / 100);
  return tax;
};

const formatNaira = (kobo) => {
  if (!isValidAmount(kobo)) {
    throw new Error("Invalid kobo amount for formatting");
  }
  const naira = kobo / 100;
  return "₦" + naira.toFixed(2);
};

check("tax 7.5% of 10000", calculateTax(10000), 750);
check("format 1999", formatNaira(1999), "₦19.99");
check("calculateTax accepts zero", calculateTax(0), 0);
// Add at least 3 more checks of your own, including one that should THROW.
function checkThrows(testName, fn) {
  try {
    fn();
    console.log(
      `❌ FAIL: ${testName} | Expected to throw an error, but it did not.`
    );
    return false;
  } catch (error) {
    console.log(`✅ PASS: ${testName} | Threw as expected: "${error.message}"`);
    return true;
  }
}
// 1. THROW CHECK: Verify that passing a string to calculateTax throws an error
checkThrows("calculateTax throws on invalid string input", () =>
  calculateTax("10000")
);
// 2. NORMAL CHECK: Verify calculateTax works with a custom tax rate (e.g., 15% VAT)
check("tax 15% of 20000", calculateTax(20000, 15), 3000);
// 3. NORMAL CHECK: Verify formatNaira handles the maximum allowed kobo value correctly
check("format MAX_KOBO", formatNaira(MAX_KOBO), "₦999000000000.00");
// 4. THROW CHECK (Bonus): Verify that formatNaira throws on 0, since isValidAmount requires kobo >= 1
checkThrows("formatNaira throws on 0", () => formatNaira(0));
// (A check for a throw: wrap the call in try/catch and return true/false from a small helper.)

// ---------------------------------------------------------------
// Exercise 4: Small arrow helpers (one line each)
// toKobo(naira)  -> naira * 100, rounded to a whole number. Why round? Try toKobo(19.99) without rounding first.
// rounding because toKobo(19.99) will give 1998.9999999999998 which should not happen in currency. no such thing as a fraction of a kobo.
const toKobo = (naira) => Math.round(naira * 100);
console.log(toKobo(19.99));
// toNaira(kobo)  -> kobo / 100
const toNaira = (kobo) => kobo / 100;
// isEven(n)      -> true if n is even
const isEven = (n) =>
  typeof n === "number" && Number.isInteger(n) && n % 2 === 0;

check("toKobo 19.99", toKobo(19.99), 1999);
check("toKobo 0.1 + 0.2 as naira", toKobo(0.1 + 0.2), 30);
check("toNaira 1999", toNaira(1999), 19.99);
check("isEven 4", isEven(4), true);
check("isEven 7", isEven(7), false);
// Add 2 more checks. What should isEven(3.5) do? Write your decision in a comment. This should give false because 3.5 cannot be divided by 2 w/o a remainder
check("isEven 3.5", isEven(3.5), false);
check("isEven '4'", isEven("4"), false); // % operator can perform type coercion meaning a string containing a number can behave like a number in this calculation so i gave it conditions. in payment we cant have that
check("toNaira 0", toNaira(0), 0);

// ---------------------------------------------------------------
// Exercise 5: Closures (a function that remembers)
// a) makeCounter() returns a function. Each time you call THAT function it returns
//    1, then 2, then 3... The count must NOT be visible from outside.

function makeCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

//
const counterA = makeCounter();
const counterB = makeCounter();
check("A first", counterA(), 1);
check("A second", counterA(), 2);
check("B is independent", counterB(), 1);
//
// b) makeTaxCalculator(ratePercent) returns a function that takes kobo and
//    returns the tax. The rate is "remembered".

function makeTaxCalculator(ratePercent) {
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    throw new Error("Invalid tax rate");
  }

  return (kobo) => calculateTax(kobo, ratePercent);
}
//
const vat = makeTaxCalculator(7.5);
const noTax = makeTaxCalculator(0);
check("vat 10000", vat(10000), 750);
check("noTax 10000", noTax(10000), 0);
check("vat 10001 rounds to whole kobo", vat(10001), 750);
checkThrows("vat rejects string amount", () => vat("10000"));
checkThrows("vat rejects negative amount", () => vat(-5));

//
// Comment: where does the rate live after makeTaxCalculator has finished running? it goes and stays in a closure
// Payment angle: validate the rate when makeTaxCalculator is CALLED, not when the
// returned function is used. Why is failing early better here? makeTaxCalculator's job is to set up a valid calculator. The returned function's job is to do math.
// By validating early, the returned function is kept fast without worrying about error handling
// ---------------------------------------------------------------
// Exercise 6: Find and fix the shared-state bug
// This code is meant to give each customer their own running total.
// Run it, read the output, explain the bug in a comment, then fix it.. Both customers are using same global total.
// Customer B amount is added to the value left behind by customer A

function makeTotal() {
  let total = 0;

  return function addToTotal(amountKobo) {
    total = total + amountKobo;
    return total;
  };
}

const customerA = makeTotal();
const customerB = makeTotal();

console.log("Customer A total:", customerA(1000), "(expected 1000)");
console.log("Customer B total:", customerB(500), "(expected 500)");

// Hint: Exercise 5 already showed you how to give each owner a private variable.

// ---------------------------------------------------------------
// Exercise 7: Think (answer in a comment, no code)
// 1. Why is a global variable that holds money dangerous when two requests
//    arrive at nearly the same time? (This returns in Phase 3 as race conditions.)
// They will read the same global variable without having a chance to even update it and use the same variable resulting in a wrong calculation
// 2. When would you pick an arrow function and when a normal function, in your own words?
// I will use arrow function for simple expressions while normal function will be for situations where the body requires more complex logic
// 3. Day 1 follow-up, answer in a comment: give ONE concrete example where
//    `"500" == 500` or `"" == 0` would hide a bug in a payment, and say what the
//    bug would cost.
// Using == can let invalid input through because it coerces types.
// For example, if (received == 0) treats an empty string as zero,
// because "" == 0 evaluates to true.
// The order could be marked paid with ₦0 received,
// allowing an unpaid order to be released.
