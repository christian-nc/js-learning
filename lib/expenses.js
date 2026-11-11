// The expense tracker's rules and its file handling.
// Day 5 (day15-plan.md): nairaToKobo, validateExpense, nextId, loadExpenses,
// addExpense, summarize. Day 6 (day16-plan.md): removeExpense.
// Tests: exercises15.js and exercises16.js. The CLI is expenses.js.

const { isValidAmount } = require("./money");
const { ValidationError } = require("./errors");
const { loadJson, saveJson } = require("./files");

// Already written for you.
// The allowed categories, in the order `total` prints them (Day 6).
const CATEGORIES = ["food", "transport", "bills", "other"];
const MAX_DESCRIPTION = 100;

// Already written for you. Read it before Exercise 1.
// Input: anything.
// Output: true only for a string made of one or more digits 0-9, nothing else.
// Empty: "" returns false.
// Bad input: non-strings return false. So do "-5", "1.5", " 1", "1e3", "١".
// /^[0-9]+$/ is a regular expression: ^ start, [0-9] one digit, + one or
// more of them, $ end. So the WHOLE string must be digits. Regular
// expressions come later; for now this one line is all you need.
const isDigits = (text) => typeof text === "string" && /^[0-9]+$/.test(text);

// Input: A string representing an amount in Naira (e.g., "25", "25.5", "100.00").
// Output: A positive integer representing the exact amount in whole kobo (e.g., 2500, 2550, 10000).
// Empty: "" throws a ValidationError (fails the isDigits check on the whole part).
// Bad input: Non-strings throw a ValidationError. So do multiple dots ("1.2.3"), non-digits in the whole part 
// ("-5", "1,000", "abc", " 5"), invalid fractions ("12.", "12.345", "12.a"), zero amounts ("0", "0.00"), or amounts exceeding MAX_KOBO.
function nairaToKobo(text) {
  if (typeof text !== "string") {
    throw new ValidationError("Amount must be text", "amount");
  }

  const parts = text.trim().split(".");
  if (parts.length > 2) {
    throw new ValidationError(`Invalid amount: ${text}`, "amount");
  }

  const [whole, fraction] = parts;

  if (!isDigits(whole)) {
    throw new ValidationError(`Invalid amount: ${text}`, "amount");
  }

  if (fraction !== undefined) {
    if (!isDigits(fraction) || fraction.length > 2) {
      throw new ValidationError(`Invalid amount: ${text}`, "amount");
      }
    }

   // Work out the kobo using padEnd for the fraction
   const fractionKobo = fraction ? Number(fraction.padEnd(2, "0")) : 0;
   const kobo = Number(whole) * 100 + fractionKobo; 

  if (!isValidAmount(kobo)) {
    throw new ValidationError(`Invalid amount: ${text}`, "amount");
  }

  // Return the kobo
  return kobo;
}


// Input: An object representing an expense (e.g., { amount: 2500, description: "Lunch", category: "food" }).
// Output: A new, validated object with exactly { amount, description, category }
// Empty: {} throws a ValidationError (fails the amount).
// Bad input: Non-objects, null, or arrays throw "Expense must be an object". So do invalid amounts (0, null, > MAX_KOBO), 
// missing/empty descriptions, descriptions over MAX_DESCRIPTION characters, or invalid categories (null, "invalid", 123).
function validateExpense(input) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Expense must be an object", "input");
  }

  const { amount, description, category = "other" } = input;

  if (!isValidAmount(amount)) {
    throw new ValidationError(`Invalid amount: ${amount}`, "amount");
  }

  if (typeof description !== "string") {
    throw new ValidationError("Description is required", "description");
  }

  const cleanDescription = description.trim();
  if (cleanDescription === "") {
    throw new ValidationError("Description is required", "description");
  }
  if (cleanDescription.length > MAX_DESCRIPTION) {
    throw new ValidationError(`Description is too long (max ${MAX_DESCRIPTION} characters)`, 
      "description")
  };

  const cleanCategory =
  typeof category === "string" ? category.trim().toLowerCase(): null;
    if (!CATEGORIES.includes(cleanCategory)) {
      throw new ValidationError(`Invalid category: ${category}`, "category");
    }
  
  return { 
    amount, description: cleanDescription, category: cleanCategory };
}



// Input: An array of expense record objects
// Output: A positive integer representing the next available ID (the highest ID in the list + 1).
// Empty: [] returns 1.
// Bad input: Items in the list that are null, non-objects, 
// or have IDs that are not safe integers of at least 1 throw a plain Error with (Bad record in expenses file: <item as JSON>)
// "Known limitation: deleting the highest id lets it be reused. Fix: a saved counter."
function isValidRecord(item) {
  return (
    item !== null &&
    Number.isSafeInteger(item.id) &&
    item.id >= 1
  );
}

function nextId(list) {
  const maxId = list.reduce((max, item) => {

    if (!isValidRecord(item)) {
      throw new Error(`Bad record in expenses file: ${JSON.stringify(item)}`);
  }

    return Math.max(max, item.id);
}, 0);

return maxId + 1;
}

// Input: A string representing the file path (e.g., "expenses.json").
// Output: An array of expense records (or an empty array if the file is missing/empty).
// Empty: If the file is empty or missing, throws an error. 
// Bad input: Non-string paths throw (via loadJson). 
// If the file contains a non-array (e.g., an object, string, or null), throws Error("Expected an array in ${filePath}").

function loadExpenses(filePath) {
  const list = loadJson(filePath, []);
  if (!Array.isArray(list)) throw new Error(`Expected an array in ${filePath}`);
  return list;
}

// Input: A file path (string), an expense input object, and a valid Date object for 'now'.
// Output: The newly created and saved expense record object ({ id, amount, description, category, createdAt }).
// Empty: N/A (requires valid inputs to proceed).
// Bad input: Invalid input object throws ValidationError. 
// Invalid 'now' throws Error("now must be a valid Date"). File read/write errors or corrupted files throw plain Errors.
function addExpense(filePath, input, now) {
  const fields = validateExpense(input);

  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error("now must be a valid Date");
  }

  const list = loadExpenses(filePath);

  const record = {
    id: nextId(list),
    amount: fields.amount,
    description: fields.description,
    category: fields.category,
    createdAt: now.toISOString()
  };

  list.push(record);
  saveJson(filePath, list);
  return record;
}

// Input: An array of valid expense records (e.g.,{ amount: 1000, category: "transport" }]).
// Output: An object with { count, total, byCategory }, where byCategory maps each seen category to its total amount in kobo, with keys in the order each category was first seen.
// Empty: [] returns { count: 0, total: 0, byCategory: {} }.
// Bad input: N/A (assumes the list contains only valid records produced by addExpense).
function summarize(list) {
  return list.reduce((acc, record) => {
    acc.count += 1;
    acc.total += record.amount;
    
    const category = record.category;
    if (acc.byCategory[category] === undefined) {
      acc.byCategory[category] = 0;
    }
    acc.byCategory[category] += record.amount;
    return acc;
    
  }, { count: 0, total: 0, byCategory: {} });
}

// TODO (Day 6, Exercise 1): contract, then body. Spec is in day16-plan.md.
function removeExpense(filePath, id) {
  throw new Error("TODO: write removeExpense");
}

module.exports = {
  CATEGORIES,
  isDigits,
  nairaToKobo,
  validateExpense,
  nextId,
  loadExpenses,
  addExpense,
  summarize,
  removeExpense,
};

