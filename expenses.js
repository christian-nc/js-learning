// Week 3, Days 5-6 - CLI expense tracker
// Plan: day16-plan.md. Tests: exercises16.js.
//
// Run it like this (amounts are typed in naira, stored in kobo):
//   node expenses.js add 2500 "lunch with team" food
//   node expenses.js list
//   node expenses.js total
//   node expenses.js remove 2
//
// Your expenses are saved to expenses.json next to this file. That file is
// in .gitignore: it's your own data, not code.

const path = require("path");
const { formatNaira } = require("./lib/money");
const { ValidationError } = require("./lib/errors");
const {
  CATEGORIES,
  isDigits,
  nairaToKobo,
  addExpense,
  loadExpenses,
  summarize,
  removeExpense,
} = require("./lib/expenses");

// Already written for you: what `help` (or no command) prints.
const USAGE = [
  "Usage:",
  "  node expenses.js add <amount> <description> [category]",
  "  node expenses.js list",
  "  node expenses.js total",
  "  node expenses.js remove <id>",
  `Categories: ${CATEGORIES.join(", ")} (default: other)`,
];

// TODO (Day 6, Exercise 2): contract, then body. Spec is in day16-plan.md.
// Returns an array of output lines. Never calls console.log itself.
function runCommand(args, filePath, now) {
  throw new Error("TODO: write runCommand");
}

// TODO (Day 6, Exercise 3): body. Spec is in day16-plan.md.
// The only function that talks to the terminal.
function main() {
  throw new Error("TODO: write main");
}

// Already written for you.
// require.main is the file you started with `node`. When you run
// `node expenses.js`, it is this file, so main() runs. When exercises16.js
// does require("./expenses"), it is NOT this file, so main() doesn't run
// and the tests can call runCommand directly.
if (require.main === module) {
  main();
}

module.exports = { runCommand, USAGE };
