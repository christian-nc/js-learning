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

// Input: args: An array of strings representing the command and arguments,
//        filepath: A string containing the location of the JSON file where the expenses are.
//        now: The Date passed to addExpense() when creating a new expense
// Output: Returns information as text, usually in an array of strings
// Empty input: - No command supplied: args = []. The function returns USAGE.
//              - No expenses in the JSON file: The list command returns ["No expenses yet."]
//              - For total, an empty expense file should produce a zero total and zero expenses.
// Bad Input: Throws specified error for specified types of bad input
function runCommand(args, filePath, now) {
  const [command] = args;

  if (!command) {
    return USAGE;
  }
  if (command === "help") {
    return USAGE;
  }

  if (command === "add") {
    if (args.length !== 3 && args.length !== 4) {
      throw new ValidationError(
        "Usage: add <amount> <description> [category]",
        "args"
      );
    }
    const amount = nairaToKobo(args[1]);
    const record = addExpense(
      filePath,
      { amount, description: args[2], category: args[3] },
      now
    );

    return [
      `Added #${record.id}: ${formatNaira(record.amount)} ${record.description} (${record.category})`,
    ];
  }

  if (command === "list") {
    if (args.length !== 1) {
      throw new ValidationError("Usage: list", "args");
    }
    const expenses = loadExpenses(filePath);

    if (expenses.length === 0) {
      return ["No expenses yet."];
    }

    return expenses.map((expense) => {
      const date = expense.createdAt.slice(0, 10);
      return `#${expense.id} ${date} ${formatNaira(expense.amount)} [${expense.category}] ${expense.description}`;
    });
  }

  if (command === "total") {
    if (args.length !== 1) {
      throw new ValidationError("Usage: total", "args");
    }

    const { total, count, byCategory } = summarize(loadExpenses(filePath));
    const expenseWord = count === 1 ? "expense" : "expenses";
    const lines = [`Total: ${formatNaira(total)} (${count} ${expenseWord})`];

    for (const category of CATEGORIES) {
      if (byCategory[category] !== undefined) {
        lines.push(`  ${category}: ${formatNaira(byCategory[category])}`);
      }
    }
    return lines;
  }

  if (command === "remove") {
    if (args.length !== 2) {
      throw new ValidationError("Usage: remove <id>", "args");
    }
    if (!isDigits(args[1])) {
      throw new ValidationError(`Invalid id: ${args[1]}`, "id");
    }
    const record = removeExpense(filePath, Number(args[1]));
    return [
      `Removed #${record.id}: ${formatNaira(record.amount)} ${record.description}`,
    ];
  }

  throw new ValidationError(`Unknown command: ${command}`, "command");
}

// The only function that talks to the terminal.
function main() {
  const filePath =
    process.env.EXPENSES_FILE || path.join(__dirname, "expenses.json");

  try {
    const lines = runCommand(process.argv.slice(2), filePath, new Date());
    console.log(lines.join("\n"));
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    } else {
      console.error(
        "Unexpected error (this is a bug or a problem with the data file):"
      );
      console.error(error);
      process.exitCode = 2;
    }
  }
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
