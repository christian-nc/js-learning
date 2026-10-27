// Week 2, Day 5 - a small function library (average, max, word counter)
// Plan and reading list: day09-plan.md
// Run with: node library.js

// Same helpers as before. check uses === on purpose (no type coercion).
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// Compares arrays AND objects as JSON text. Key order must match.
function checkList(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  console.log(
    `${a === e ? "PASS" : "FAIL"} - ${label} (got ${a}, expected ${e})`
  );
}

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

// Copy MAX_KOBO, isValidAmount and sumReduce from exercises08.js here.
// (Week 3: you'll export these from one file instead of copying them.)
const MAX_KOBO = 99900000000000;

const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

const sumReduce = (list) => {
  return list.reduce((total, amount) => {
    if (!isValidAmount(amount)) {
      throw new Error(`Invalid amount detected: ${amount}`);
    }

    const newTotal = total + amount;

    // Check if the new running total is still a safe integer
    if (!Number.isSafeInteger(newTotal)) {
      throw new Error(
        `Running total exceeded safe integer limits: ${newTotal}`
      );
    }

    return newTotal;
  }, 0);
};

const KNOWN_STATUSES = new Set(["succeeded", "failed", "pending"]);

const normalizeStatus = (status) => {
  if (typeof status !== "string") {
    throw new Error(`Invalid transaction status: ${status}`);
  }

  const normalized = status.trim().toLowerCase();
  if (!KNOWN_STATUSES.has(normalized)) {
    throw new Error(`Unknown transaction status: ${status}`);
  }

  return normalized;
};

// ---------------------------------------------------------------
// Contract template. Copy it above each function you write and fill it in.
//
// name(input)
//   Input:       what it accepts (types, units, limits)
//   Output:      what it returns (type, units, whole number or not?)
//   Empty input: what happens with [] or ""
//   Bad input:   throw, or return the bad items? Which, and why?

// ---------------------------------------------------------------
// Exercise 1: Warm-up, predict then run
// Write your prediction in a comment above each line.

// prediction: 10
console.log(Math.max(3, 10, 7));
// prediction: -Infinity
console.log(Math.max());
// prediction: 10
console.log(Math.max(3, "10"));
// prediction: NaN
console.log(Math.max(3, "abc"));
// prediction: NaN
console.log(0 / 0);
// prediction: empty
console.log([].length === 0 ? "empty" : "not empty");
// prediction: 101, 100, 101
console.log(Math.round(100.5), Math.round(100.4), Math.round(100.6));
// prediction: 9999999999999999 ; got 9007199254740991
console.log(Number.MAX_SAFE_INTEGER);
// prediction: 9007199254740993 got 9007199254740992
console.log(9007199254740991 + 2);

// Questions (comments):
// 1. If a "largest payment today" report used Math.max() on an empty day, what
//    would the report show? Is that an error, or silent?
// It will show infinity. It is silent and I will prefer that it throws an error
// 2. 9007199254740991 + 2 didn't throw. What did it give, and why is that worse
//    than an error when the number is money?
// it gave 9007199254740992 beacuse it rounded to the nearest representable number. This is worse because it is a silent error
// and Silent rounding lets the wrong number go through the entire system.
// A user's balance or an interest rate will be wrong, and and it will be saved to the database. It is also hard to debug unlike an error that throws
// and alerts the developer immediately
// ---------------------------------------------------------------
// Exercise 2: Objects as lists
// Object.keys/values/entries turn an object into an ARRAY, so map/filter/reduce work on it.

const byStatus = { succeeded: 4, failed: 1, pending: 1 };

// prediction: [ 'succeeded', 'failed', 'pending' ]
console.log(Object.keys(byStatus));
// prediction:[ 4, 1, 1 ]
console.log(Object.values(byStatus));
// prediction: [ [ 'succeeded', 4 ], [ 'failed', 1 ], [ 'pending', 1 ] ]
console.log(Object.entries(byStatus));
// prediction: (what is the type of the result?) boolean: true
console.log(Array.isArray(Object.keys(byStatus)));

// a) Using Object.keys and filter (one expression), get the statuses that have a
//    count above 1. Store it in manyStatuses.
const manyStatuses = Object.keys(byStatus).filter(
  (status) => byStatus[status] > 1
);

checkList("statuses with count above 1", manyStatuses, ["succeeded"]);

// b) What does Object.keys({}) return? Predict, then check it.
// prediction: it returns an empty array
console.log(Object.keys({}));
// ---------------------------------------------------------------
// Exercise 3: The Day 4 self-check
// countsMatchTotal(summary) returns true if the numbers in summary.byStatus add up
// to summary.count, and false if they don't.
// Use Object.values and reduce. Write the contract first.
// Contract:
// {Object} summary - An object containing a total count and a status breakdown.
// {number} summary.count - The expected total number of items.
// {Object} summary.byStatus - An object where values are numbers representing counts per status.
// @returns {boolean} - True if the sum of values in byStatus equals summary.count, false otherwise.
// Edge Cases:
// Empty input: throwing for malformed input and returning false when a valid summary has inconsistent counts

// write countsMatchTotal here

const countsMatchTotal = (summary) => {
  return (
    Object.values(summary.byStatus).reduce((a, b) => a + b, 0) === summary.count
  );
};

check(
  "counts match",
  countsMatchTotal({
    count: 6,
    byStatus: { succeeded: 4, failed: 1, pending: 1 },
  }),
  true
);
check(
  "counts don't match",
  countsMatchTotal({
    count: 6,
    byStatus: { succeeded: 3, failed: 1, pending: 1 },
  }),
  false
);
check("empty day", countsMatchTotal({ count: 0, byStatus: {} }), true);
// Question (comment): this check doesn't repeat any of summarizeDay's logic.
// Why does that make it stronger than the cross-check you wrote yesterday?
// An independent check verifies the underlying rule by a different route. It should catch the bug rather
// than repeat it in a different location

// ---------------------------------------------------------------
// Exercise 4: average(list)
// The average of a list of kobo amounts.
// Write the contract first. Your contract must answer these:
//   - Empty list: throw, or return something? (Hint: what is 0 / 0?)
//   - The average of [100, 101] is 100.5 kobo. Half a kobo can't be paid.
//     Will you round, round down, or round up? Write WHY in one line.
//   - Bad item (string, 0, decimal): reuse sumReduce, which already rejects them.

// Contract:
// - Empty list: throw an error because an average of zero items is undefined (0 / 0 is NaN).
// - Rounding: round to the nearest whole kobo because half a kobo cannot be paid. it minimizes the absolute rounding error, unlike always rounding down.
// - Bad items: reuse sumReduce, which rejects strings, zero, and decimals.

// write average here
const average = (list) => {
  if (list.length === 0) {
    throw new Error("Cannot calculate average of an empty list");
  }
  return Math.round(sumReduce(list) / list.length);
};

check("average of two", average([100, 200]), 150);
check("average of one", average([500]), 500);
checkThrows("average of empty list", () => average([]));
checkThrows("average rejects a string", () => average([100, "200"]));
// Add a test for [100, 101] that matches YOUR rounding decision:
check("average rounds 100.5 up", average([100, 101]), 101);

// Add a test that the result is always a whole number of kobo (Number.isInteger):
check(
  "average returns whole kobo",
  Number.isInteger(average([100, 101])),
  true
);

// ---------------------------------------------------------------
// Exercise 5: max, largestTransaction, and a safe total

// a) max(list): the largest kobo amount. Use a loop OR reduce, NOT Math.max.
// Contract:
// - Return the largest valid kobo amount in the list.
// - Throw an error for an empty list.
// - Reject invalid amounts by reusing isValidAmount.

//    Contract first. Empty list must NOT return -Infinity (Exercise 1).
//    Hint for reduce: is 0 a good initial value? What about using the first item?
//    (Remember Day 4: what does reduce do on [] with no initial value?)

// write max here
const max = (list) => {
  // Ensure an empty list wont work
  if (list.length === 0) {
    throw new Error("Cannot calculate max of an empty list");
  }

  // Before reduce():
  if (!isValidAmount(list[0])) {
    throw new Error("Invalid amount in list");
  }

  return list.reduce((max, current) => {
    if (!isValidAmount(current)) {
      throw new Error("Cannot calculate max on an invalid list");
    }

    return current > max ? current : max;
  });
};

check("max of three", max([500, 2000, 999]), 2000);
check("max with a tie", max([700, 700]), 700);
check("max of one", max([42]), 42);
checkThrows("max of empty list", () => max([]));
checkThrows("max rejects a string", () => max([500, "9999"]));
// Question (comment): if max accepted the string "9999", which would win against 500?
// 9999 will win because javascript will convert it to number
// (Exercise 1 has a clue.) Would a report notice? No. A report wont notice
checkThrows("max rejects an invalid first item", () => max(["9999", 500]));

// b) largestTransaction(list): returns the whole transaction OBJECT with the biggest
//    amountKobo, not just the number. Reuse max (one rule in one place), then find
//    the object. If two tie, return the first one and say so in the contract.

const transactions = [
  { id: "T1", amountKobo: 500000, status: "succeeded" },
  { id: "T2", amountKobo: 120000, status: "failed" },
  { id: "T3", amountKobo: 2000000, status: "succeeded" },
  { id: "T4", amountKobo: 2000000, status: "pending" },
  { id: "T5", amountKobo: 2000000, status: "succeeded" },
];

// write largestTransaction
// Contract:
// - Return the largest successful transaction.
// Excludes pending payments because they haven't necessarily been received successfully.
// - If multiple transactions tie, return the first.
// - Throw if there are no successful transactions.

const largestTransaction = (list) => {
  const successful = list.filter(
    (t) => normalizeStatus(t.status) === "succeeded"
  );

  if (successful.length === 0) {
    throw new Error("No successful transactions");
  }

  const maxAmount = max(successful.map((t) => t.amountKobo));
  return successful.find((t) => t.amountKobo === maxAmount);
};

check(
  "largest is T3 (first of a tie)",
  largestTransaction(transactions).id,
  "T3"
);

checkThrows("throws on empty list", () => largestTransaction([]));
// Question (comment): T3 and T4 tie, but T4 is only pending. Should a "largest
// payment received" report include pending payments? What would you change?
// I would exclude pending transactions.
// A pending payment hasn't necessarily been received successfully.
const differentList = [
  { id: "T1", amountKobo: 10000, status: "pending" },
  { id: "T2", amountKobo: 5000, status: "succeeded" },
];
check(
  "ignores pending and finds largest successful",
  largestTransaction(differentList).id,
  "T2"
);

// c) Safe total. Every item below is a valid amount (MAX_KOBO), but is the total safe?
//    Build bigList: an array with 100 copies of MAX_KOBO, using a for loop and push.
//    Then predict what sumReduce(bigList) returns, and run it.
// prediction: because JavaScript numbers are IEEE-754 double-precision floats,
// they lose precision beyond Number.MAX_SAFE_INTEGER
//multiplying it by 100 will exceed the safe integer limit, resulting in a number with lost trailing digits.
// Is the result bigger than Number.MAX_SAFE_INTEGER? Check with Number.isSafeInteger.
// Yes. If you check the result, Number.isSafeInteger() will return false
// because the sum has exceeded the maximum safe limit for JavaScript integers.

// Change sumReduce so it throws when the running total stops being safe.
// Add a checkThrows for bigList, and make sure the Day 4 tests still pass.
const bigList = [];

for (let i = 0; i < 100; i++) {
  bigList.push(MAX_KOBO);
}

checkThrows("Running total exceeded", () => sumReduce(bigList));

// ---------------------------------------------------------------
// Exercise 6: wordCount(text)
// Returns an object counting each word, in the order first seen:
//   wordCount("paid Paid refunded") -> { paid: 2, refunded: 1 }
// Contract first. Decide: is "Paid" the same word as "paid"? (Yes, today.)
// Contract:
// Input: A string containing words separated by spaces.
// Case: Treat uppercase and lowercase versions of a word as the same word.
// Output: An object where each lowercase word is a key and its value
//   is the number of times that word appears.
// Order: Words are recorded in the order they are first encountered.
// Empty input: Return {} for an empty string or a string containing
//   only spaces.
// Extra spaces: Ignore empty pieces created by leading, trailing,
//   or repeated spaces. These are splitting artifacts, not actual words.
// Bad input: Throw an error if the input is not a string.
// Punctuation: For now, punctuation remains attached to words.
// Hints:
//   - Try "a  b".split(" ") and "".split(" ") in node first. What empty items appear?
//   - Skipping empty strings is allowed here. Write one line saying WHY it's not
//     a "silent skip" of bad data.
//   - Day 4 Exercise 5 is the same shape: reduce into an object.

// write wordCount here

// Reject input that is not a string
const wordCount = (text) => {
  if (typeof text !== "string") {
    throw new Error("Input must be a string");
  }

  // Convert to lowercase, split into words and remove empty spaces
  const words = text
    .toLowerCase()
    .split(" ")
    .filter((word) => word !== "");

  // count each word by building an object
  return words.reduce((counts, word) => {
    counts[word] = (counts[word] || 0) + 1;
    return counts;
  }, {});
};
checkList("simple", wordCount("paid paid refunded"), { paid: 2, refunded: 1 });
checkList("mixed case", wordCount("Paid PAID paid"), { paid: 3 });
checkList("extra spaces", wordCount("  paid   refunded  "), {
  paid: 1,
  refunded: 1,
});
checkList("empty string", wordCount(""), {});
checkList("only spaces", wordCount("   "), {});
checkThrows("not a string", () => wordCount(42));
// Predict, then run: what does your function give for "paid, paid."?
// prediction: ('paid':2) but got { 'paid,': 1, 'paid.': 1 }
console.log(wordCount("paid, paid."));
// Is that what a reader wants? Write what you'd do about punctuation (you don't
// have to fix it today; Day 1's regular expressions are one way).
// No, its not. I will like to account for it and remove it using regex
//

// ---------------------------------------------------------------
// Exercise 7: Contracts and Think (comments only)
// 1. Look at your contracts for average, max and wordCount. Which one returns
//    something for empty input, and which ones throw? Why are they different?
// average([]) and max([]) throws an error because an empty input not being caught on time
// will show up as NaN and mess up important transactions calaculations depending on the implementation. wordCount("") returns {} because the function treats an
// empty string as containing no words and represents the word counts as an object.// 2. A payment provider's docs say: "amount: integer, smallest currency unit,
//    minimum 100". Which of your functions already keep that kind of promise?
// isValidAmount . Currently it accepts a minimum of 1 but cant be edited if needed
// 3. Exercise 5c: name one real situation where adding valid amounts could pass
//    Number.MAX_SAFE_INTEGER. (Hint: a year of payments for a large merchant? In kobo?)
// an ecommerce online store processing thousands or millions of transactions throughout a year. Every transaction might be valid individually, yet their cumulative
// total could become too large for JavaScript to represent every integer exactly
