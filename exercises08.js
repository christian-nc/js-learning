// Week 2, Day 4 - exercises (reduce and objects)
// Plan and reading list: day08-plan.md
// Run with: node exercises08.js

// Same helper as before. It uses === on purpose (no type coercion).
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// Compares arrays AND objects by turning them into JSON text.
// Limitations: NaN and Infinity become null, and for objects the KEY ORDER
// must match too ({a: 1, b: 2} and {b: 2, a: 1} give different text).
function checkList(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  console.log(
    `${a === e ? "PASS" : "FAIL"} - ${label} (got ${a}, expected ${e})`
  );
}

// Your helper from exercises06.js.
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

// Copy MAX_KOBO, isValidAmount, isValidAmountOrZero and formatNaira from exercises07.js.
const MAX_KOBO = 99900000000000;

const isValidAmountOrZero = (kobo) => {
  return kobo === 0 || isValidAmount(kobo);
};

const formatNaira = (kobo) => {
  if (!isValidAmount(kobo)) {
    throw new Error("Invalid kobo amount for formatting");
  }
  const naira = kobo / 100;
  return "₦" + naira.toFixed(2);
};

const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

// Use one status rule everywhere: normalize known statuses, reject missing/unknown ones.
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

// (Notice how often you copy these. Week 3 fixes that with modules: import/export.)

// ---------------------------------------------------------------
// Exercise 1: Warm-up, two silent results from Day 3
// Both of these ran WITHOUT an error and gave an answer that looked fine.

// a) Predict, then run. Error, or a value? Which value?
const ids = ["T1", "T2", "T3"];
// prediction: [] an empty array
console.log(ids.filter((id) => id.status === "succeeded"));
// Why? (What is "T1".status? What does the comparison give for every item?)
// "T1".status does not have a status property so javascript will evaluate it to undefined.
// Because this comparison is false for every item in the array, filter excludes all of them and returns a new, empty array 
// In exercises07.js (Exercise 5) your comment says this "will return undefined".
// Go back and correct that comment.
// Question: in payment code, which is worse: a crash, or an empty list that looks
// like "no successful payments today"? Why?
// an empty list that silently looks like "no successful payments today" is worse than a crash
// Why? because the system will continue to run with incorrect data. 
// Business logic might proceed under the false assumption that zero payments were made. This can lead to orders not being fulfilled, 
// incorrect accounting and undetected bugs that might take days or weeks to discover

// b) Yesterday's applySelectDiscount returned [4900, 2400, 900, 80, 100].
//    1. Why was 100 left unchanged? Is 0 kobo a valid result after a 100 kobo discount?
//  The 100kobo remains unchanged because it does not pass the > test. 
//  If the business rule says a 100-kobo item can receive a 100-kobo discount, the resulting price of zero will be valid for this exercise.
//    2. 80 was skipped quietly. Your own Exercise 8 answer said bad items should be
//       kept and reported. Write applyDiscountStrict(prices) that does NOT quietly
//       skip a price below 100. Choose ONE: throw an error, or something else you
//       can defend. Write your choice and the reason in a comment.

// write applyDiscountStrict here

// All-or-nothing discount. 
// One bad price rejects the whole batch. This is good because in payment that's often what you want
// rather no discounts than apply half of them and end up unsure which were done
function applyDiscountStrict(prices) {
  const discountedPrices = prices.map((price) => {
    if (price < 100 || !isValidAmount(price)) {
      throw new Error(`Invalid price: ${price}. Prices below 100 do not qualify for a discount.`);
    }

    return price - 100;
});

  return discountedPrices;
}
checkList("strict: 100 becomes 0", applyDiscountStrict([5000, 100]), [4900, 0]);
checkThrows("strict: 80 throws an error", () =>
  applyDiscountStrict([5000, 80])
);
// Uncomment the line above once the function exists, then add a test for [5000, 80]
// that matches your choice (checkThrows if you chose to throw).

// ---------------------------------------------------------------
// Exercise 2: Predict, then run (object basics)
// Write your PREDICTION in a comment above each console.log.

const payment = {
  id: "P1",
  amountKobo: 150000,
  currency: "NGN",
  status: "pending",
};

// prediction: 150000
console.log(payment.amountKobo);
// prediction:NGN
console.log(payment["currency"]);

const field = "status";
// prediction: pending
console.log(payment[field]);
// prediction: (careful) undefined
console.log(payment.field);

// prediction: undefined
console.log(payment.fee);
// prediction: NaN
console.log(payment.fee + 100);
// prediction: false
console.log("fee" in payment);

// payment is a const. Does this line throw? Predict, then run.
payment.status = "succeeded";
// prediction: it runs because the variable might be a const but the object itself is not immutable
console.log(payment.status);

payment.feeKobo = 1500;
// prediction: payment now has amountKobo: 150000, status: "succeeded",
// and feeKobo: 1500. The status changed earlier, before this log.
console.log(payment);

const samePayment = payment;
samePayment.amountKobo = 1;
// prediction: 1
console.log(payment.amountKobo);
// prediction: false, javascript compares objects by reference identity
console.log({ id: "P1" } === { id: "P1" });

// Questions (comments):
// 1. When do you NEED brackets instead of a dot? (Look at payment[field] vs payment.field.)
// Brackets are needed when the key is stored in a variable, or the key has spaces/dashes.
// payment[field] reads the value in the variable field; payment.field looks for the literal key "field".
// For example, payment["payment-status"] works, but payment.payment-status does not mean that key.
// 2. A typo like payment.amountkobo (small k) doesn't throw. What does it give, and
//    what happens if that value goes into a total?
//  it gives undefined and gives NaN when calculated into a total. Always better to validate a required missing payment before using it in a calculation 
// 3. samePayment changed payment. Is that the same idea as sameList and cart yesterday?
// Yes

// ---------------------------------------------------------------
// Exercise 3: Sum a list of amounts
// You need isValidAmount from exercises07.js for this (copy it above).

// a) sumLoop(list): a for loop and a running total. Returns the total in kobo.
const sumLoop = (list) => {
  let total = 0;

  for (let i = 0; i < list.length; i++) {
    const amount = list[i];

  if (!isValidAmount(amount)) {
    throw new Error (`invalid amount detected: ${amount}`)
  }

  total += amount;
}

  return total;
}

// b) sumReduce(list): the same result using reduce.
//    Before you write it, answer in a comment:
//    - What is the accumulator in this case?
//  the accumulator should be total, the result built up so far
//    - What should the initial value be, and why?
// Initial value 0 because nothing has been added yet

// Silent-result rule: reject the entire list by throwing if any amount is invalid; never skip bad items.
const sumReduce = (list) => {
  return list.reduce((total, amount) => {
    if (!isValidAmount(amount)) {
      throw new Error(`Invalid amount detected: ${amount}`);
    }
    return total + amount;
  }, 0);
};

check("loop: sum", sumLoop([1000, 250, 199]), 1449);
check("reduce: sum", sumReduce([1000, 250, 199]), 1449);
check("reduce: empty day totals 0", sumReduce([]), 0);
check("reduce: one item", sumReduce([500]), 500);

// c) Predict, then run: reduce on an EMPTY list with NO initial value.
// prediction: it will return TypeError
try {
  console.log([].reduce((total, kobo) => total + kobo));
} catch (error) {
  console.log("Error:", error.message);
}
// Why does the initial value fix this? What does a day with no payments total?
// Without an initial value, reduce() tries to use the first item in the array as its initial accumulator. 
// But an empty array has no first item. A day with no payments total as 0, the initial value

// d) What should sumReduce([1000, "500"]) do? Before validation, + would concatenate
// the number and string, producing "1000500" instead of the numeric total 1500.
// The safe behavior is to throw, because a string amount is invalid.

checkThrows(
  "sumReduce rejects a string amount",
  () => sumReduce([1000, "500"])
);


// ---------------------------------------------------------------
// Exercise 4: Total the successful transactions (filter + reduce)

const transactions = [
  { id: "T1", amountKobo: 500000, status: "succeeded" },
  { id: "T2", amountKobo: 120000, status: "failed" },
  { id: "T3", amountKobo: 75050, status: "succeeded" },
  { id: "T4", amountKobo: 999, status: "pending" },
  { id: "T5", amountKobo: 2000000, status: "succeeded" },
  { id: "T6", amountKobo: 3000000, status: "Succeeded" }
];

// Silent-result rule: reject missing/unknown statuses; sum every recognized succeeded transaction.
// totalSucceeded(list): the sum of amountKobo for "succeeded" transactions only.
// One chained expression. Can you reuse something you wrote in Exercise 3?
const totalSucceeded = (list) => {
  return sumReduce(
    list
      .filter((transaction) => normalizeStatus(transaction?.status) === "succeeded")
      .map((transaction) => transaction.amountKobo)
  );
};

check("total succeeded", totalSucceeded(transactions), 5575050);
check("total succeeded: empty list", totalSucceeded([]), 0);
check(
  "total succeeded: none succeeded",
  totalSucceeded([{ id: "X", amountKobo: 100, status: "failed" }]),
  0
);
// Question (comment): why should a FAILED payment never be in this total?
// A "failed" status means the transaction was declined, or dropped by the payment gateway or the customer's bank so no money changed hands
// What would the business think happened if it were?
// the business might ship physical goods or credit a user's wallet for a payment that never cleared.

// ---------------------------------------------------------------
// Exercise 5: Count per status (reduce into an object)
// countByStatus(list) returns an object like { succeeded: 3, failed: 1, pending: 1 }.
// The accumulator is an OBJECT this time, so the initial value is {}.
// Hint: the status is in a variable (t.status), so dot or brackets?
// Hint: the first time you see a status, counts[status] is... what? (Exercise 2.)

// Silent-result rule: throw for a missing or unknown status instead of silently counting it as "undefined".
const countByStatus = (list) => {
  return list.reduce((acc, t) => {
    const status = normalizeStatus(t?.status);
    if (acc[status] === undefined) {
      acc[status] = 0;
    }
    acc[status] = acc[status] + 1;
    return acc;
  }, {});
};

checkList("count by status", countByStatus(transactions), {
  succeeded: 4,
  failed: 1,
  pending: 1,
});
checkList("count by status: empty", countByStatus([]), {});
check("normalize mixed-case status with trailing space", normalizeStatus("SUCCEEDED "), "succeeded");
checkThrows("reject an unknown status", () => countByStatus([{ status: "refunded" }]));
checkThrows("reject a transaction with no status", () => countByStatus([{ id: "T-missing" }]));
// "Succeeded" is normalized to "succeeded"; an unknown status is rejected, not silently added.

// ---------------------------------------------------------------
// Exercise 6: Find and fix three reduce bugs
// Run each one, PREDICT the output first, explain the bug in a comment, then fix it.
// Note: none of these crash. That is the point.

// Bug A: should total 1750
// prediction: Output will be undefined 
const totalA = [500, 1000, 250].reduce((total, kobo) => {
  return total + kobo;
}, 0);
console.log("Bug A:", totalA);
// The bug: there is no return statement

// Bug B: should total all six transaction amounts (5696049)
// prediction: numeric gibberish
const totalB = transactions.reduce((total, t) => total + t.amountKobo, 0);
console.log("Bug B:", totalB);
// The bug: Reduce comes with an initial parameter which was not written

// Bug C: these amounts came from a CSV file. Should total 1750.
// Without conversion, + can concatenate strings. Convert CSV fields to numbers, then validate.
const csvAmounts = ["500", "1000", "250"];
const totalC = sumReduce(csvAmounts.map(Number));
console.log("Bug C:", totalC);
// The bug: CSV fields arrive as strings. Convert them with map(Number), then let sumReduce
// reject NaN (from "abc"), decimals (from "12.50"), and other invalid amounts.
// A CSV decimal or non-numeric field should not be accepted as a valid whole-kobo amount.
checkThrows("CSV rejects abc after conversion", () =>
  sumReduce(["500", "1000", "250", "abc"].map(Number))
);
checkThrows("CSV rejects decimal 12.50 after conversion", () =>
  sumReduce(["500", "1000", "250", "12.50"].map(Number))
);

// Prediction: Number("") is 0, and Number(" 500 ") is 500.
// The blank field becomes 0, but sumReduce rejects 0 because individual amounts must be positive.
check("Number empty string becomes zero", Number(""), 0);
check("Number trims whitespace around 500", Number(" 500 "), 500);
check("CSV accepts surrounding whitespace after conversion", sumReduce([" 500 "].map(Number)), 500);
checkThrows("CSV rejects blank amount after conversion", () => sumReduce([""].map(Number)));
// ---------------------------------------------------------------
// Exercise 7: Build a daily summary
// summarizeDay(list) returns ONE object. For the six transactions below, the expected shape is:
// {
//   count: 6,
//   succeededKobo: 5575050,
//   succeededFormatted: "₦55750.50",
//   byStatus: { succeeded: 4, failed: 1, pending: 1 },
// }
// Reuse your functions from Exercises 4 and 5 and formatNaira. Don't repeat their logic
// (one rule in one place). Keep the keys in this order so checkList can compare them.

// Silent-result rule: reject the whole summary if any transaction has a missing/unknown status or invalid succeeded amount.
const summarizeDay = (list) => {
  const succeededKobo = totalSucceeded(list);
  const succeededFormatted = succeededKobo === 0 ? "₦0.00" : formatNaira(succeededKobo);

  return {
    count: list.length,
    succeededKobo: succeededKobo,
    succeededFormatted: succeededFormatted,
    byStatus: countByStatus(list),
  };
};

checkList("summary", summarizeDay(transactions), {
  count: 6,
  succeededKobo: 5575050,
  succeededFormatted: "₦55750.50",
  byStatus: { succeeded: 4, failed: 1, pending: 1 },
});
checkList("summary: empty day", summarizeDay([]), {
  count: 0,
  succeededKobo: 0,
  succeededFormatted: "₦0.00",
  byStatus: {},
});

// ---------------------------------------------------------------
// Exercise 8: Think (answer in a comment, no code)
// 1. In your own words: what does reduce return? Does it change the original array?
// reduce iterate over an array and returns an accumulated value. it does not change the original array
// 2. Bug A, B and C all gave a wrong answer without an error. Pick one and describe
//    how it could reach a real merchant's settlement report without anyone noticing.
//// If a `reduce` callback forgets to `return` the accumulator (Bug A), the accumulator 
// becomes `undefined` in the next run, resulting in `NaN` or an incomplete 
// object. If this happens in a job that calculates daily settlements, the 
// final report might show a total of 0 or missing data. Because it doesn't throw a 
// crash, the system continues running, and the merchant receives an incorrect settlement 
// without any immediate error alerting the team.
// 3. Cross-check the amount with a separately filtered list using the same documented status rule.
// If totalSucceeded forgets to normalize "Succeeded", this test fails even if the main expected
// value was accidentally copied from the buggy result.
const summaryForCrossCheck = summarizeDay(transactions);
const independentlySummedSucceeded = sumReduce(
  transactions
    .filter((transaction) => normalizeStatus(transaction.status) === "succeeded")
    .map((transaction) => transaction.amountKobo)
);
check(
  "summary succeeded amount agrees with normalized succeeded transactions",
  summaryForCrossCheck.succeededKobo,
  independentlySummedSucceeded
);
