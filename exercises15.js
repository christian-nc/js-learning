// Week 3, Day 5 - expense tracker core (lib/expenses.js)
// Plan and reading list: day15-plan.md
// Run with: node exercises15.js
//
// This file only TESTS. You write the functions in lib/expenses.js.
// Do Exercise 0 from the plan first (make lib/files.js). Until then this
// file crashes with "Cannot find module './files'". After that, sections
// you haven't reached yet crash with "Error: TODO: write <name>".

const fs = require("fs");
const path = require("path");
const { check, checkList, catchError } = require("./lib/testing");
const { ValidationError } = require("./lib/errors");
const { loadJson } = require("./lib/files");
const {
  nairaToKobo,
  validateExpense,
  nextId,
  loadExpenses,
  addExpense,
  summarize,
} = require("./lib/expenses");

// Scratch folder, deleted and made again on every run (same as Day 4).
const DIR = path.join(__dirname, "tmp-day15");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR);
const fileIn = (name) => path.join(DIR, name);

// ---------------------------------------------------------------
// Section 1: nairaToKobo - text from a human -> whole kobo
// ---------------------------------------------------------------
// 1a. Predict first. What does JavaScript give for 1.15 * 100?
// Prediction: 114.99999999999999
check("1a the float trap", 1.15 * 100, 114.99999999999999);

// 1b. Good input
check("1b whole naira", nairaToKobo("2500"), 250000);
check("1b one decimal place", nairaToKobo("25.5"), 2550);
check("1b two decimal places", nairaToKobo("25.50"), 2550);
check("1b only kobo", nairaToKobo("0.05"), 5);
check("1b the float trap, done right", nairaToKobo("1.15"), 115);
check("1b spaces around it", nairaToKobo(" 12.30 "), 1230);
check("1b the largest allowed", nairaToKobo("999000000000"), 99900000000000);

// 1c. Bad text: every one must be a ValidationError, field "amount",
// message exactly "Invalid amount: <the text exactly as given>"
const badTexts = [
  "",
  "abc",
  "12.345",
  "1.2.3",
  "-5",
  "0",
  "0.00",
  "12.",
  ".5",
  "1e3",
  "1,000",
  "12abc",
  "999999999999",
];
for (const text of badTexts) {
  const error = catchError(() => nairaToKobo(text));
  const ok =
    error instanceof ValidationError &&
    error.field === "amount" &&
    error.message === `Invalid amount: ${text}`;
  check(`1c refused "${text}" (${error.message})`, ok, true);
}

// 1d. Not text at all
const numberAmount = catchError(() => nairaToKobo(2500));
check("1d a number: field", numberAmount.field, "amount");
check("1d a number: message", numberAmount.message, "Amount must be text");

// ---------------------------------------------------------------
// Section 2: validateExpense - check fields, return a clean copy
// ---------------------------------------------------------------
checkList(
  "2a clean input",
  validateExpense({ amount: 250000, description: "lunch", category: "food" }),
  { amount: 250000, description: "lunch", category: "food" }
);
checkList(
  "2a trims and lowercases",
  validateExpense({
    amount: 1,
    description: "  taxi ",
    category: " Transport",
  }),
  { amount: 1, description: "taxi", category: "transport" }
);
checkList(
  "2b no category means other",
  validateExpense({ amount: 500, description: "airtime" }),
  { amount: 500, description: "airtime", category: "other" }
);
checkList(
  "2c extra keys are dropped",
  validateExpense({
    id: 999,
    amount: 500,
    description: "airtime",
    createdAt: "1999-01-01T00:00:00.000Z",
  }),
  { amount: 500, description: "airtime", category: "other" }
);

// 2d. Bad input. Each row: [input, expected field, expected message]
const badExpenses = [
  [null, "input", "Expense must be an object"],
  [[1, 2], "input", "Expense must be an object"],
  [{ amount: "500", description: "x" }, "amount", "Invalid amount: 500"],
  [{ amount: 12.5, description: "x" }, "amount", "Invalid amount: 12.5"],
  [{ amount: 500 }, "description", "Description is required"],
  [
    { amount: 500, description: "   " },
    "description",
    "Description is required",
  ],
  [
    { amount: 500, description: "x".repeat(101) },
    "description",
    "Description is too long (max 100 characters)",
  ],
  [
    { amount: 500, description: "x", category: "fun" },
    "category",
    "Invalid category: fun",
  ],
  [
    { amount: 500, description: "x", category: null },
    "category",
    "Invalid category: null",
  ],
  // the first bad field wins: amount is checked before description
  [{ amount: -1, description: "" }, "amount", "Invalid amount: -1"],
];
for (const [input, field, message] of badExpenses) {
  const error = catchError(() => validateExpense(input));
  const label = `2d ${JSON.stringify(input).slice(0, 40)}`;
  check(`${label}: ValidationError`, error instanceof ValidationError, true);
  check(`${label}: field`, error.field, field);
  check(`${label}: message`, error.message, message);
}
check(
  "2e exactly 100 characters is allowed",
  validateExpense({ amount: 1, description: "x".repeat(100) }).description
    .length,
  100
);

// ---------------------------------------------------------------
// Section 3: nextId - the next free id for a list
// ---------------------------------------------------------------
check("3a empty list", nextId([]), 1);
check("3a ids 1, 2, 3", nextId([{ id: 1 }, { id: 2 }, { id: 3 }]), 4);
check("3b out of order", nextId([{ id: 1 }, { id: 5 }, { id: 2 }]), 6);
check("3b after #2 was removed", nextId([{ id: 1 }, { id: 3 }]), 4);

// 3c. A broken record is OUR file's problem: plain Error, not ValidationError
const badRecords = [[null], [{ id: "2" }], [{ id: 0 }], [{ id: 1 }, {}]];
for (const list of badRecords) {
  const error = catchError(() => nextId(list));
  const ok =
    error instanceof Error &&
    !(error instanceof ValidationError) &&
    error.message.startsWith("Bad record in expenses file");
  check(`3c refused ${JSON.stringify(list)} (${error.message})`, ok, true);
}

// ---------------------------------------------------------------
// Section 4: loadExpenses and addExpense - load, check, change, save
// ---------------------------------------------------------------
fs.writeFileSync(fileIn("corrupt.json"), '[{"id":1,');
fs.writeFileSync(fileIn("object.json"), '{"id":1}');

checkList(
  "4a loadExpenses: missing file",
  loadExpenses(fileIn("none.json")),
  []
);
check(
  "4a loadExpenses: object file",
  catchError(() => loadExpenses(fileIn("object.json"))).message.startsWith(
    "Expected an array in"
  ),
  true
);
check(
  "4a loadExpenses: corrupt file",
  catchError(() => loadExpenses(fileIn("corrupt.json"))).message.startsWith(
    "Corrupt JSON in"
  ),
  true
);

const file = fileIn("expenses.json");
const NOW = new Date("2026-11-08T12:00:00Z");

checkList(
  "4b first expense",
  addExpense(
    file,
    { amount: 250000, description: " lunch ", category: "FOOD" },
    NOW
  ),
  {
    id: 1,
    amount: 250000,
    description: "lunch",
    category: "food",
    createdAt: "2026-11-08T12:00:00.000Z",
  }
);
check(
  "4b second expense gets id 2",
  addExpense(
    file,
    { amount: 75000, description: "taxi", category: "transport" },
    NOW
  ).id,
  2
);
check(
  "4b no category",
  addExpense(file, { amount: 50000, description: "airtime" }, NOW).category,
  "other"
);
check("4b three on disk", loadJson(file, []).length, 3);

// 4c. Bad input: refused, nothing written
const badAdd = catchError(() =>
  addExpense(file, { amount: 0, description: "x" }, NOW)
);
check("4c bad amount: field", badAdd.field, "amount");
check("4c ...still three on disk", loadJson(file, []).length, 3);
const never = fileIn("never.json");
catchError(() => addExpense(never, { amount: 100 }, NOW));
check("4c no file made for bad input", fs.existsSync(never), false);

// 4d. A bad clock is OUR bug, not the caller's: plain Error
const badNow = catchError(() =>
  addExpense(file, { amount: 100, description: "x" }, new Date("not a date"))
);
check("4d bad now: message", badNow.message, "now must be a valid Date");
check(
  "4d bad now: NOT a ValidationError",
  badNow instanceof ValidationError,
  false
);
const noNow = catchError(() =>
  addExpense(file, { amount: 100, description: "x" })
);
check("4d missing now: message", noNow.message, "now must be a valid Date");
check("4d ...still three on disk", loadJson(file, []).length, 3);

// 4e. Our own file is broken: refuse, and don't touch it
const onCorrupt = catchError(() =>
  addExpense(fileIn("corrupt.json"), { amount: 100, description: "x" }, NOW)
);
check(
  "4e corrupt: message",
  onCorrupt.message.startsWith("Corrupt JSON in"),
  true
);
check(
  "4e corrupt: file untouched",
  fs.readFileSync(fileIn("corrupt.json"), "utf8"),
  '[{"id":1,'
);
fs.writeFileSync(fileIn("bad-record.json"), "[null]");
const onBadRecord = catchError(() =>
  addExpense(fileIn("bad-record.json"), { amount: 100, description: "x" }, NOW)
);
check(
  "4e [null] in the file: message",
  onBadRecord.message.startsWith("Bad record in expenses file"),
  true
);
check(
  "4e [null] in the file: untouched",
  fs.readFileSync(fileIn("bad-record.json"), "utf8"),
  "[null]"
);

// ---------------------------------------------------------------
// Section 5: summarize - count, total and total per category
// ---------------------------------------------------------------
checkList("5a empty", summarize([]), { count: 0, total: 0, byCategory: {} });
checkList(
  "5b a small list",
  summarize([
    { amount: 100, category: "food" },
    { amount: 200, category: "bills" },
    { amount: 300, category: "food" },
  ]),
  { count: 3, total: 600, byCategory: { food: 400, bills: 200 } }
);
const fromDisk = summarize(loadExpenses(file));
checkList("5c the file from Section 4", fromDisk, {
  count: 3,
  total: 375000,
  byCategory: { food: 250000, transport: 75000, other: 50000 },
});

// 5d. Independent self-check: add up the per-category totals here, without
// summarize, and compare with the total summarize reported.
const categorySum = Object.values(fromDisk.byCategory).reduce(
  (a, b) => a + b,
  0
);
check("5d categories add up to the total", categorySum, fromDisk.total);

// ---------------------------------------------------------------
// Section 6: Think (comments only). Questions are in the plan.
// ---------------------------------------------------------------
// 1. Calling new Date() will make the timestamp to depend on the exact millisecond the test happened to run.
// using now makes the function predictable. Test 4b asserts the exact string "2026-11-08T12:00:00.000Z"
//
// 2. Using length + 1  For the list [{ id: 1 }, { id: 3 }], the length is 2. length + 1 would evaluate to 3.
// meaning the the system would assign id: 3 to the new expense, resulting in duplicate IDs in the database.
// In financial systems, an id is an anchor for audit trail that should not be reused. 
//
// 3. A malicious user could send extra fields in their API request body that the system will
// save to the database. This could result in fake payment statuses, altered financial records.
// validateExpense builds a new object from only the fields it allows, instead of copying everything the caller sent.
//
// 4. This is for financial integrity. Silent rounding preempts and changes user's intent. It might be a typo
// and rounding it will lead to confusion and frustrated customers. refusing forces the user to correct the data to a valid format
