// Week 3, Day 2 - modules
// Plan and reading list: day12-plan.md
// Run with: node exercises12.js
//
// Do Exercise 1 (try-require.js) first. Then work down this file.
// Sections you haven't reached yet will crash. Read WHICH name the error
// complains about: it tells you which exercise you're up to.
//
// No helpers are copied into this file any more. They come from lib/.

// ---------------------------------------------------------------
// Section 2: lib/testing.js
// ---------------------------------------------------------------
// TODO (Exercise 2): require check, checkList and checkThrows from
// lib/testing.js here, using destructuring (yesterday's topic).
const { check, checkList, checkThrows } = require("./lib/testing");

// Tests for the upgraded checkThrows. Predict before running:
// how many PASS lines and how many FAIL lines will this section print?
// Prediction: 4 PASS lines, 2 FAIL lines. (The FAIL lines are expected.)

// 2a. Old style, no expectedText: must still work.
checkThrows("old style still works", () => {
  throw new Error("anything");
});

// 2b. Right reason: the message includes the expected text.
checkThrows(
  "right reason",
  () => {
    throw new Error("Invalid amount detected: abc");
  },
  "Invalid amount"
);

// 2c. Wrong reason. This throws a TypeError, not your own error.
// The helper should print ONE FAIL line here. That FAIL is correct.
const wrongReasonResult = checkThrows(
  "wrong reason (this FAIL line is expected)",
  () => {
    const payment = undefined;
    return payment.amount; // TypeError: Cannot read properties of undefined
  },
  "Invalid amount"
);
check("helper returned false for the wrong reason", wrongReasonResult, false);

// 2d. Did not throw at all: helper should print FAIL and return false.
const noThrowResult = checkThrows(
  "no throw (this FAIL line is expected)",
  () => 42,
  "Invalid amount"
);
check("helper returned false when nothing threw", noThrowResult, false);

// ---------------------------------------------------------------
// Section 3: lib/money.js
// ---------------------------------------------------------------
// TODO (Exercise 3): require MAX_KOBO, isValidAmount, formatNaira and
// sumReduce from lib/money.js here.
const {
  MAX_KOBO,
  isValidAmount,
  formatNaira,
  sumReduce,
} = require("./lib/money");

// Exactly these four names, nothing else (sorted, so order doesn't matter).
checkList(
  "money.js exports exactly four names",
  Object.keys(require("./lib/money")).sort(),
  ["MAX_KOBO", "formatNaira", "isValidAmount", "sumReduce"]
);

// isValidAmount
check("5000 kobo is valid", isValidAmount(5000), true);
check("1 kobo is valid", isValidAmount(1), true);
check("0 kobo is not valid", isValidAmount(0), false);
check("string '5000' is not valid", isValidAmount("5000"), false);
check("10.5 kobo is not valid", isValidAmount(10.5), false);
check("MAX_KOBO is valid", isValidAmount(MAX_KOBO), true);
check("MAX_KOBO + 1 is not valid", isValidAmount(MAX_KOBO + 1), false);

// formatNaira
check("250050 kobo", formatNaira(250050), "₦2500.50");
check("zero is allowed for display", formatNaira(0), "₦0.00");
checkThrows("formatNaira rejects -1", () => formatNaira(-1), "Invalid kobo");
checkThrows(
  "formatNaira rejects a string",
  () => formatNaira("100"),
  "Invalid kobo"
);

// sumReduce
check("sum of three", sumReduce([100, 200, 300]), 600);
check("sum of empty list is 0", sumReduce([]), 0);
checkThrows(
  "sumReduce rejects a string",
  () => sumReduce([100, "200"]),
  "Invalid amount"
);

// 90 x MAX_KOBO = 8,991,000,000,000,000. Still below MAX_SAFE_INTEGER
// (9,007,199,254,740,991), so this must NOT throw.
const ninety = new Array(90).fill(MAX_KOBO);
check("90 x MAX_KOBO is still safe", sumReduce(ninety), 8991000000000000);

// 91 x MAX_KOBO goes past MAX_SAFE_INTEGER, so it must throw for THAT reason.
const ninetyOne = new Array(91).fill(MAX_KOBO);
checkThrows(
  "91 x MAX_KOBO is not safe",
  () => sumReduce(ninetyOne),
  "Running total exceeded"
);

// ---------------------------------------------------------------
// Section 4: lib/status.js
// ---------------------------------------------------------------
// TODO (Exercise 4): require normalizeStatus from lib/status.js here.
const { normalizeStatus } = require("./lib/status");

// 4a. Same behaviour as Week 2.
check("trims and lowercases", normalizeStatus("  Succeeded "), "succeeded");
check("pending stays pending", normalizeStatus("pending"), "pending");
checkThrows(
  "refunded is not a known status (yet)",
  () => normalizeStatus("refunded"),
  "Unknown transaction status"
);
checkThrows(
  "a number is not a status",
  () => normalizeStatus(42),
  "Invalid transaction status"
);

// Only normalizeStatus is shared. KNOWN_STATUSES stays private.
checkList(
  "status.js exports only normalizeStatus",
  Object.keys(require("./lib/status")),
  ["normalizeStatus"]
);

// 4b. The shared-data trap. Follow the steps in the plan (Exercise 4, step 3).
// Uncomment ONLY after adding KNOWN_STATUSES to module.exports in status.js.
// The "exports only normalizeStatus" test above will FAIL while you do this.
// That's expected; it goes back to PASS in step (d).
//
// Prediction for line A: "hacked"
// Prediction for line B: "hacked"
//
// const statusModule = require("./lib/status");
// statusModule.KNOWN_STATUSES.add("hacked"); // some other file does this...
// console.log("A:", statusModule.normalizeStatus("hacked"));
//
// const anotherFileLoadsIt = require("./lib/status");
// console.log("B:", anotherFileLoadsIt.normalizeStatus("hacked"));
//
// Step (c), one sentence: why did "hacked" get accepted?
// Because another file modified the exported Set directly. Both files
// received the same Set object, so normalizeStatus saw the added status.
// Step (d), predicted error after removing KNOWN_STATUSES from module.exports: TypeError
// Actual error: TypeError: Cannot read properties of undefined (reading 'add')

// ---------------------------------------------------------------
// Section 5: Break it on purpose (comments only)
// ---------------------------------------------------------------
// For each: first line of the error, then the cause in one sentence.
// Undo each change before the next one.
//
// a)
//    require("./lib/money") without ./
//    Error:
//    Error: Cannot find module 'lib/money'
//    Cause: Without ./, Node treats the name as a built-in module or package
//    request. It does not search my own project folder for lib/money.js.
//
// b) misspelt name in the require line (isValidAmout)
//    Error:
//    ReferenceError: isValidAmount is not defined
//    Cause: I declared isValidAmout, but the rest of my code still uses
//    isValidAmount, which was never declared.
//    
//
//    ESLint reports:
//    no-unused-vars: isValidAmout is declared but never used.
//    no-undef: isValidAmount is used but never declared.
//
// c) exports = { ... } instead of module.exports = { ... } in lib/money.js
//    Error:  No error from require itself.
//    First FAIL:
//    FAIL - money.js exports exactly four names
//    (got [], expected ["MAX_KOBO","formatNaira","isValidAmount","sumReduce"])

//    First TypeError:
//    TypeError: isValidAmount is not a function

//    Cause:
//    Reassigning exports does not replace module.exports.
//    The module therefore returns an empty object.
// ---------------------------------------------------------------
// Section 7: Think (comments only). Questions are in the plan.
// ---------------------------------------------------------------
// 1. lib/status.js acts as a single source of validation. Every file
// that needs to check a status must require and use normalizeStatus(), so
// there is only one copy of the rule (KNOWN_STATUSES) in the whole app.
// What could still go wrong: A developer might ignore the module and write
// their own hardcoded status checks (like `if (status === 'pending')`)
// in a new file, accidentally creating a second, unmanaged rule.
//
// 2. normalizeStatus is a function; calling it just reads the private data and
// returns a string, leaving the internal state unchanged. KNOWN_STATUSES is
// a mutable Set. If exported, any other file could call .add() or .delete()
// on it, permanently altering the allowed statuses for the entire application.
//
// 3. The module runs top-to-bottom, so chargeCard() is executed immediately and the card is charged.
// For the second file: Because Node caches modules, the file is NOT run again. The
// second require just returns the cached exports, so the card is NOT charged again.
// Important: the cache only lasts for the current Node process.
// Restarting the server creates a new process, so the top-level
// chargeCard() call executes again.
//
// 4. // 4. Differences I observed between CommonJS and ESM:
//
// 1. CommonJS uses require() and module.exports.
//    ESM uses import and export.
//
// 2. My ESM relative import needed the .mjs extension.
//    CommonJS successfully loaded ./lib/money without .js.
//
// 3. require() worked in my CommonJS file but caused a
//    ReferenceError when I tried it inside an .mjs file.
