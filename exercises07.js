// Week 2, Day 3 - exercises (arrays, map and filter)
// Plan and reading list: day07-plan.md
// Run with: node exercises07.js

// Same helper as before. It uses === on purpose (no type coercion).
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// New helper for arrays. Exercise 2 shows why `check` can't compare arrays.
// It turns both arrays into JSON text and compares the text.
// Limitation: JSON turns NaN and Infinity into null, so don't use it to test those.
function checkList(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  console.log(
    `${a === e ? "PASS" : "FAIL"} - ${label} (got ${a}, expected ${e})`
  );
}

// Copy your checkThrows helper from exercises06.js here if you want to test throws.

// ---------------------------------------------------------------
// Exercise 1: Warm-up, closure and scope tracing (Day 2 follow-up)
// Write your PREDICTION in a comment above each console.log, then run and compare.
// After each one, write one sentence: WHY?

let fee = 100;

function makeFeeAdder() {
  return (kobo) => kobo + fee;
}

const addFee = makeFeeAdder();
fee = 200;
// 1200
console.log(addFee(1000)); // Why? The returned arrow function refers to the variable (fee), it does not freeze the value of fee at the moment the function is created

function makeFixedFeeAdder(fixedFee) {
  return (kobo) => kobo + fixedFee;
}

const addFixedFee = makeFixedFeeAdder(100);
fee = 300;
// 1100
console.log(addFixedFee(1000)); // why? because the returned function closes over the parameter fixedFee, which was set to 100 in that function call

for (let i = 0; i < 3; i++) {
  // empty on purpose
}
// undefined
console.log(typeof i); // why? because the i is block scoped inside the loop

// Question (comment): does a closure remember the VALUE a variable had when the
// function was created, or the VARIABLE itself? Use the first two results as evidence.
// A closure remembers the variable itself not the value it had during creation. this way the closure will get an updated value if the variable changes later like in fee
// Which of the two fee adders would you trust in payment code, and why? I chose the second because i like the concept of a fee you cannot mistakenly change down the line.

// ---------------------------------------------------------------
// Exercise 2: Predict, then run (array basics)

const pricesKobo = [10000, 25050, 199, 0];

// 10000
console.log(pricesKobo[0]);
// undefined
console.log(pricesKobo[4]);
// 4
console.log(pricesKobo.length);
// 0
console.log(pricesKobo[pricesKobo.length - 1]);

const cart = [];
const result = cart.push(500);
// 1 because push() returns the new length of the array, not the array itself
console.log(result); // careful: what does push RETURN?
// [500]
console.log(cart);
// false
console.log([1, 2] === [1, 2]);
const sameList = cart;
// true
console.log(sameList === cart);

// Question (comment): why is `[1, 2] === [1, 2]` false, but `sameList === cart` true?
// in javascript, `[1, 2] === [1, 2]` is false because they are two distinct identical arrays but sameList === cart is simply assigning the same box a different variable name
// (Hint: yesterday you learned `const` stops reassignment, not changes to the
// contents. The same "variable vs contents" idea explains this.)
// Then: sameList.push(999) and log `cart`. Predict first.
// [500, 999] push() adds an item to the end of the existing array and  reason cart changed is that sameList and cart are the same array
sameList.push(999);
console.log(cart);
// ---------------------------------------------------------------
// Exercise 3: Add VAT to every price
// Copy calculateTax (and isValidAmount, isValidAmountOrZero, MAX_KOBO) from exercises06.js.
const MAX_KOBO = 99900000000000;

const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

const isValidAmountOrZero = (kobo) => {
  return kobo === 0 || isValidAmount(kobo);
};

const isValidRate = (ratePercent) => {
  return Number.isFinite(ratePercent) && ratePercent >= 0 && ratePercent <= 100;
};

const calculateTax = (kobo, ratePercent = 7.5) => {
  if (!isValidRate(ratePercent)) {
    throw new Error("Invalid tax rate");
  }
  if (!isValidAmountOrZero(kobo)) {
    throw new Error(
      "Invalid kobo amount: must be a valid positive whole number or zero"
    );
  }

  return Math.round(kobo * (ratePercent / 100));
};
// Day 2 leftover: calculateTax and makeTaxCalculator had DIFFERENT rate rules
// (one allowed rates above 100, one didn't). Decide where the rate rule lives,
// put it in ONE small helper (for example isValidRate), and write a comment saying why.

// a) withVatLoop(prices): use a for loop and push into a NEW array.
//    Each item is price + VAT at 7.5%. Use calculateTax, don't repeat the math.
const prices = [10000, 25000, 200, 0];

const withVatLoop = (prices) => {
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    const tax = calculateTax(prices[i]);
    result.push(prices[i] + tax);
  }

  return result;
};

// b) withVatMap(prices): same result using map. One line if you can.
const withVatMap = (prices) =>
  prices.map((price) => price + calculateTax(price));

checkList(
  "loop: VAT on prices",
  withVatLoop(pricesKobo),
  [10750, 26929, 214, 0]
);
checkList("map: VAT on prices", withVatMap(pricesKobo), [10750, 26929, 214, 0]);
checkList("map: original unchanged", pricesKobo, [10000, 25050, 199, 0]);
checkList("map: empty list", withVatMap([]), []);
// Add one check of your own. What should happen if the list contains "500"?
let errorThrown = false;
let capturedMessage = "";

try {
  // Attempting to process an array containing a string
  withVatMap([10000, "500"]);
} catch (error) {
  errorThrown = true;
  capturedMessage = error.message;
}

checkList(
  "map: throws error on string input",
  { errorThrown, capturedMessage },
  {
    errorThrown: true,
    capturedMessage:
      "Invalid kobo amount: must be a valid positive whole number or zero",
  }
);
// Write your decision in a comment. I decided it should throw an error for data integrity

// Question (comment): count the lines in a) and b). What did map do for you
// that you had to do yourself in the loop? map took care of the for loop

// ---------------------------------------------------------------
// Exercise 4: filter and map on transactions
// Each transaction is an object. Read a field with a dot: t.status, t.amountKobo.
// (Objects get a full day tomorrow. Today you only need to READ fields.)

const transactions = [
  { id: "T1", amountKobo: 500000, status: "succeeded" },
  { id: "T2", amountKobo: 120000, status: "failed" },
  { id: "T3", amountKobo: 75050, status: "succeeded" },
  { id: "T4", amountKobo: 999, status: "pending" },
  { id: "T5", amountKobo: 2000000, status: "succeeded" },
];

// a) getIds(list): returns just the ids, for example ["T1", "T2", ...]  (map)
const getIds = (list) => {
  return list.map((t) => t.id);
};

// b) getSucceeded(list): only transactions whose status is "succeeded"  (filter)
const getSucceeded = (list) => {
  return list.filter((t) => t.status === "succeeded");
};

// c) getLarge(list, minKobo): only transactions with amountKobo >= minKobo  (filter)
const getLarge = (list, minKobo = 1000000) => {
  return list.filter((t) => t.amountKobo >= minKobo);
};

checkList("all ids", getIds(transactions), ["T1", "T2", "T3", "T4", "T5"]);
checkList("succeeded", getSucceeded(transactions), [
  transactions[0],
  transactions[2],
  transactions[4],
]);
checkList("large: >= ₦10,000", getLarge(transactions, 1000000), [
  transactions[4],
]);
checkList("large: none match", getLarge(transactions, 99999999), []);
// Add one check: what does getSucceeded([]) return? Predict first.
// it returns an empty array since the filter() method always returns a new array
console.log(getSucceeded([]));
// Question (comment): is `"succeeded"` vs `"Succeeded"` the same status to filter?
// No it is not because javascript is case sensitive
// What could go wrong if a provider sends a status in a different case?
// Metrics and reports will split counts (e.g., treating "succeeded" and "Succeeded" as two separate statuses).
// Broken logic: Conditional branches or switch statements will fail to trigger the correct path, falling back to default/error states.
// ---------------------------------------------------------------
// Exercise 5: Chaining
// Answer each question with ONE expression that chains filter and map.
// You can use the functions from Exercise 4 or write the callbacks inline.
// Copy formatNaira from exercises06.js for b).

// a) The ids of the successful transactions
const succeededIds = transactions
  .filter((t) => t.status === "succeeded")
  .map((t) => t.id);

// b) The successful amounts, formatted as Naira strings
const formatNaira = (kobo) => {
  if (!isValidAmount(kobo)) {
    throw new Error("Invalid kobo amount for formatting");
  }
  const naira = kobo / 100;
  return "₦" + naira.toFixed(2);
};

const succeededFormatted = transactions
  .filter((t) => t.status === "succeeded")
  .map((t) => formatNaira(t.amountKobo));

checkList("succeeded ids", succeededIds, ["T1", "T3", "T5"]);
checkList("succeeded formatted", succeededFormatted, [
  "₦5000.00",
  "₦750.50",
  "₦20000.00",
]);

// Question (comment): does the order matter? Would map-then-filter work for a)?
// Yes, the order matters. map-then-filter will turn each transaction object into a string, such as "T1". Then filter() will return undefined due to being unable to find a t.status property on the string
// Try it and explain what happens.
const wrongFormatted = transactions
  .map((t) => t.id)
  .filter((id) => id.status === "succeeded");

console.log(wrongFormatted);

// ---------------------------------------------------------------
// Exercise 6: Find and fix two map bugs
// Run each part, read the output, explain the bug in a comment, then fix it.

// Bug A: should double every price
// The bug here is that the original code didnt have a return for p * 2 and will return undefined for each element in the array 
const doubled = pricesKobo.map((p) => {
  return p * 2;
});
console.log("doubled:", doubled); // expected [20000, 50100, 398, 0]

// Bug B: should return discounted prices (100 kobo off each) and leave the original alone
// The bug here is that the function changes the original array which is dangerous for payments
const refundsKobo = [5000, 2500, 1000];

function applyDiscount(prices) {
  return prices.map((price) => price - 100);
}

const discounted = applyDiscount(refundsKobo);
console.log("discounted:", discounted); // expected [4900, 2400, 900]
console.log("original:  ", refundsKobo); // expected [5000, 2500, 1000]

// Bug B question (comment): this is the same kind of bug as Day 2 Exercise 6.
// What is being shared this time? Why is changing the original dangerous if
// refundsKobo is the record of what customers are owed? the parameter being shared this time is the array by both prices and refundsKobo
// it is dangerous because changing the array might change the values elsewhere in the code.
// Fix it with map. Then: what should happen if a price is below 100? Decide and comment.
// It should skip it.
// for prices below 100, I will do this
const selectRefundKobo = [5000, 2500, 1000, 80, 100];

function applySelectDiscount(prices) {
  const discountedPrices = prices.map((price) => {
    if (price > 100) {
      return price - 100;
    }

    return price;
  });

  return discountedPrices;
}

const discount = applySelectDiscount(selectRefundKobo);

console.log(discount);
// ---------------------------------------------------------------
// Exercise 7: Clean a messy list, and don't lose the rejects
// Imagine these amounts came from a CSV upload. Some are bad.

const rawAmounts = [1000, "500", -5, 2.5, NaN, 0, 300, Infinity];

// a) getValidAmounts(list): only the amounts isValidAmount accepts
const getValidAmounts = (list) => {
  return list.filter((amount) => isValidAmount(amount));
};

// b) getInvalidAmounts(list): only the ones it rejects
const getInvalidAmounts = (list) => {
  return list.filter((amount) => !isValidAmount(amount));
};

checkList("valid amounts", getValidAmounts(rawAmounts), [1000, 300]);
// NaN and Infinity show as null here (see the checkList limitation at the top).
checkList("invalid amounts", getInvalidAmounts(rawAmounts), [
  "500",
  -5,
  2.5,
  NaN,
  0,
  Infinity,
]);
// Check: valid + invalid together should equal the original length. Write that check.
const valid = getValidAmounts(rawAmounts);
const invalid = getInvalidAmounts(rawAmounts);

check(
  "all records accounted for",
  valid.length + invalid.length,
  rawAmounts.length
);
// Why is that check useful? (Hint: what would it catch if a filter had a bug?)
// The length check catches items that vanish or get counted twice because of a bug in the filters.
// To maintain good record keeping and for further investigations on why a payment failed
// before the batch can be entered as complete. It will catch undefined transaction bugs
// ---------------------------------------------------------------
// Exercise 8: Think (answer in a comment, no code)
// 1. In Exercise 7, a filter quietly removed 6 items. If this were a list of
//    customer payments to be paid out, why is "silently drop the bad ones" dangerous?
// Silently dropping the bad ones will lead to losing access to records that needs further investigation on why it didnt go through
//    What should the program do with them instead?
// Keep and report them for investigation
// 2. In your own words: what does map return, what does filter return, and does
//    either one change the original array?
// map returns a new array of the same length but with transformed items
// filter returns a new array containing only the element that met a condition
// Neither modifies the original array
// 3. When would you still choose a plain for loop over map or filter?
// when i need to return early and not iterate over the entire array
