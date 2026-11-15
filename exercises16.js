// Week 3, Day 6 - expense tracker CLI (expenses.js)
// Plan and reading list: day16-plan.md
// Run with: node exercises16.js
//
// This file only TESTS. You write removeExpense in lib/expenses.js and
// runCommand + main in expenses.js. Sections you haven't reached yet crash
// with "Error: TODO: write <name>".

const fs = require("fs");
const path = require("path");
const { check, checkList, catchError } = require("./lib/testing");
const { ValidationError } = require("./lib/errors");
const { loadJson, saveJson } = require("./lib/files");
const { removeExpense } = require("./lib/expenses");
const { runCommand, USAGE } = require("./expenses");

const DIR = path.join(__dirname, "tmp-day16");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR);
const fileIn = (name) => path.join(DIR, name);

// A small ledger to start from (amounts in kobo).
const START = [
  {
    id: 1,
    amount: 250000,
    description: "lunch",
    category: "food",
    createdAt: "2026-11-08T12:00:00.000Z",
  },
  {
    id: 2,
    amount: 75000,
    description: "taxi",
    category: "transport",
    createdAt: "2026-11-08T13:00:00.000Z",
  },
  {
    id: 3,
    amount: 50000,
    description: "airtime",
    category: "other",
    createdAt: "2026-11-08T14:00:00.000Z",
  },
];

// ---------------------------------------------------------------
// Section 1: removeExpense
// ---------------------------------------------------------------
const ledger = fileIn("remove.json");
saveJson(ledger, START);

checkList("1a returns the removed record", removeExpense(ledger, 2), START[1]);
checkList(
  "1a ids left on disk",
  loadJson(ledger, []).map((e) => e.id),
  [1, 3]
);

const gone = catchError(() => removeExpense(ledger, 2));
check(
  "1b removing #2 again: ValidationError",
  gone instanceof ValidationError,
  true
);
check("1b ...message", gone.message, "No expense with id 2");
check("1b ...field", gone.field, "id");
check("1b ...file unchanged", loadJson(ledger, []).length, 2);

for (const badId of [0, -1, 1.5, "1", undefined]) {
  const error = catchError(() => removeExpense(ledger, badId));
  check(`1c bad id ${badId}: message`, error.message, `Invalid id: ${badId}`);
}
check("1c ...file unchanged", loadJson(ledger, []).length, 2);

const nothing = fileIn("nothing.json");
check(
  "1d missing file: no such expense",
  catchError(() => removeExpense(nothing, 1)).message,
  "No expense with id 1"
);
check("1d ...and no file was made", fs.existsSync(nothing), false);

// ---------------------------------------------------------------
// Section 2: runCommand - the whole CLI, without the terminal
// ---------------------------------------------------------------
// runCommand(args, filePath, now) returns an array of output lines.
// args is what the user typed after "node expenses.js", split into words.
const cli = fileIn("cli.json");
const NOW = new Date("2026-11-08T12:00:00Z");
const run = (...args) => runCommand(args, cli, NOW);

// 2a. help
checkList("2a no command shows usage", run(), USAGE);
checkList("2a help shows usage", run("help"), USAGE);

// 2b. list and total before anything is added
checkList("2b list, empty", run("list"), ["No expenses yet."]);
checkList("2b total, empty", run("total"), ["Total: ₦0.00 (0 expenses)"]);
check("2b reading does not create the file", fs.existsSync(cli), false);

// 2c. add (the amount is typed in NAIRA, stored in kobo)
checkList("2c add with a category", run("add", "2500", "lunch", "food"), [
  "Added #1: ₦2500.00 lunch (food)",
]);
checkList("2c total, one expense", run("total"), [
  "Total: ₦2500.00 (1 expense)",
  "  food: ₦2500.00",
]);
checkList("2c add without a category", run("add", "750.50", "taxi home"), [
  "Added #2: ₦750.50 taxi home (other)",
]);
checkList("2c add, category in capitals", run("add", "0.5", "sweets", "FOOD"), [
  "Added #3: ₦0.50 sweets (food)",
]);
check("2c stored in kobo", loadJson(cli, [])[1].amount, 75050);

// 2d. list and total with data
checkList("2d list", run("list"), [
  "#1 2026-11-08 ₦2500.00 [food] lunch",
  "#2 2026-11-08 ₦750.50 [other] taxi home",
  "#3 2026-11-08 ₦0.50 [food] sweets",
]);
checkList("2d total: categories in CATEGORIES order", run("total"), [
  "Total: ₦3251.00 (3 expenses)",
  "  food: ₦2500.50",
  "  other: ₦750.50",
]);

// 2e. remove
checkList("2e remove", run("remove", "2"), ["Removed #2: ₦750.50 taxi home"]);
checkList("2e list after remove", run("list"), [
  "#1 2026-11-08 ₦2500.00 [food] lunch",
  "#3 2026-11-08 ₦0.50 [food] sweets",
]);
checkList("2e the next add gets #4, not #3", run("add", "100", "bread"), [
  "Added #4: ₦100.00 bread (other)",
]);

// 2f. Mistakes the user can make. Each row: [args, field, message]
const mistakes = [
  [["spend", "100"], "command", "Unknown command: spend"],
  [["add"], "args", "Usage: add <amount> <description> [category]"],
  [["add", "100"], "args", "Usage: add <amount> <description> [category]"],
  [
    ["add", "100", "a", "food", "extra"],
    "args",
    "Usage: add <amount> <description> [category]",
  ],
  [["add", "1,000", "rent"], "amount", "Invalid amount: 1,000"],
  [["add", "100", "  "], "description", "Description is required"],
  [["add", "100", "cinema", "fun"], "category", "Invalid category: fun"],
  [["list", "all"], "args", "Usage: list"],
  [["total", "food"], "args", "Usage: total"],
  [["remove"], "args", "Usage: remove <id>"],
  [["remove", "two"], "id", "Invalid id: two"],
  [["remove", "2.0"], "id", "Invalid id: 2.0"],
  [["remove", ""], "id", "Invalid id: "],
  [["remove", "2"], "id", "No expense with id 2"],
];
for (const [args, field, message] of mistakes) {
  const error = catchError(() => run(...args));
  const label = `2f ${JSON.stringify(args)}`;
  check(`${label}: ValidationError`, error instanceof ValidationError, true);
  check(`${label}: field`, error.field, field);
  check(`${label}: message`, error.message, message);
}
check(
  "2f ...after all those mistakes, still 3 on disk",
  loadJson(cli, []).length,
  3
);

// 2g. A broken data file is not the user's typing mistake: plain Error
fs.writeFileSync(fileIn("corrupt.json"), "[{");
const broken = catchError(() =>
  runCommand(["list"], fileIn("corrupt.json"), NOW)
);
check(
  "2g corrupt file: NOT a ValidationError",
  broken instanceof ValidationError,
  false
);
check(
  "2g corrupt file: message",
  broken.message.startsWith("Corrupt JSON in"),
  true
);

// ---------------------------------------------------------------
// Section 3: Think (comments only). Questions are in the plan.
// ---------------------------------------------------------------
// 1. The date will show 8 November because 00:30 on 9 November in Lagos is actually on 8 November in UTC.
// Using .slice(0, 10) removes the first 10 characters giving just the UTC date, not the local date
// To fix it: I could convert the string back into a javascript date object and use toLocaleDateString() passing { timeZone: "Africa/Lagos" } in the options.
//
// 2. addExpense cant refuse duplicates because the client does not send an ID. The server cant know
// if a request is a new expense or a retry of a previous one.
// The API solution is for the client to generate a unique identifier like a UUID for the specific action
// and send it in the headers or body. This is idempotency key. The server stores this key and a retry will cause the server to see the same key, realize it has already processed it and returns the original success response
//
// 3. Reason 1 (The Audit Trail): A month later, an auditor might ask,
// "What happened to payment #2?" If it was deleted, the history is gone, and it looks like the system is broken but if it was kept and add a
// refund record, the timeline clearly shows: Payment received -> Payment refunded.
// Reason 2 The payment provider (e.g., Paystack, Stripe, or a bank) has already recorded
// the original payment in their immutable ledger and included it in their reports. You cannot delete it on their end. To make your internal ledger match the provider's
// ledger and balance your accounts, you must record the refund as a new, separate transaction.
//
// 4. Exit code 0 universally means "success". Non-zero codes mean "failure". Using different non-zero codes (1 for user/typing errors,
// 2 for system/data errors) allows the calling environment to understand why the program failed.
// Automated systems read exit codes
//
// 5. It is a bad security practice because leaking internal file paths and stack traces gives malicious users
// maps of internal infrastructure.
