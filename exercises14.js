// Week 3, Day 4 - files and JSON
// Plan and reading list: day14-plan.md
// Run with: node exercises14.js
//
// Do Exercise 0 from the plan first (move catchError into lib/testing.js,
// add tmp-day14/ to .gitignore). Until then this file crashes with
// "catchError is not a function". Sections you haven't reached yet crash
// with "Error: TODO: write <name>". Read WHICH name: it tells you where you are.

const fs = require("fs");
const path = require("path");
const { check, checkList, catchError } = require("./lib/testing");
const { isValidAmount } = require("./lib/money");
const { normalizeStatus } = require("./lib/status");
const { ValidationError } = require("./lib/errors");
const { saveJson, loadJson } = require("./lib/files");

// Today's test files go in a scratch folder next to this file. It is deleted
// and made again at the start of every run, so each run starts clean.
// - __dirname is the folder THIS file is in, wherever you run node from.
// - path.join puts the pieces together with the right slash for your OS.
// - The path is a constant. Never pass a path built from user input to rmSync.
const DIR = path.join(__dirname, "tmp-day14");
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR);
const fileIn = (name) => path.join(DIR, name);

// ---------------------------------------------------------------
// Section 1: Predict JSON (nothing to write except predictions)
// ---------------------------------------------------------------
// Write each prediction in the comment BEFORE you run the file. The
// expected values in the tests are correct; if your prediction was wrong,
// write one sentence on why under it.

const payment = {
  id: "tx_1",
  amount: 5000,
  note: undefined,
  fee: NaN,
  paidAt: new Date("2026-11-06T09:30:00Z"),
};
const text = JSON.stringify(payment);

// 1a. Prediction for text: "id":"tx_1","amount":5000,"fee":null,"paidAt":"2026-11-06T09:30:00.000Z"
check(
  "1a stringify",
  text,
  '{"id":"tx_1","amount":5000,"fee":null,"paidAt":"2026-11-06T09:30:00.000Z"}'
);

const back = JSON.parse(text);
// 1b. Prediction for typeof back.paidAt: "string"
check("1b paidAt after a round trip", typeof back.paidAt, "string");
// 1c. Prediction for "note" in back (true or false): false
check("1c is note still there?", "note" in back, false);
// 1d. Prediction for back.fee: null
check("1d fee", back.fee, null);

// 1e. Prediction for JSON.stringify([undefined, 1]):"[null, 1]"
check(
  "1e undefined inside an array",
  JSON.stringify([undefined, 1]),
  "[null,1]"
);

// 1f. Your own checkList compares JSON text. Will this line print PASS or FAIL?
// Prediction: PASS
checkList("1f [undefined] vs [null]", [undefined], [null]);
// Which caveat in your checkList contract explains it? JSON.stringify converts undefined inside an array to null, so both arrays produce the identical JSON text "[null]".

// 1g. JSON numbers are JavaScript numbers. Prediction for the value: "9007199254740992"
check(
  "1g a 16-digit id",
  String(JSON.parse("9007199254740993")),
  "9007199254740992"
);

// 1h. Quotes decide the type. Prediction for typeof body.amount: "string"
const body = JSON.parse('{"amount":"5000"}');
check("1h a quoted number", typeof body.amount, "string");
check("1h ...so it fails the money rule", isValidAmount(body.amount), false);

// 1i. Prediction: does this parse, or throw? If it throws, which error name? SyntaxError
check(
  "1i single quotes",
  catchError(() => JSON.parse("{'amount': 5000}")).name,
  "SyntaxError"
);

// 1j. Pretty printing. Prediction for the exact text (where do the newlines go?): {
//   "a": 1,
//   "b": [
//     2
//   ]
// }
check(
  "1j stringify with 2 spaces",
  JSON.stringify({ a: 1, b: [2] }, null, 2),
  '{\n  "a": 1,\n  "b": [\n    2\n  ]\n}'
);

// ---------------------------------------------------------------
// Section 2: parseJson - bad JSON from a caller is a 400
// ---------------------------------------------------------------
// TODO (Exercise 2): contract, then body. Spec is in the plan.
// Input: a string of JSON text and must already be a Javascript string.
// Output: the parsed value, or throws a ValidationError if the text is not valid JSON.
// Bad Input: any string that is not valid JSON, or any non-string input, will throw a ValidationError with the field set to "body" and a message describing the problem.
// Empty Input: an empty string is a string, so it passes the type check, but it is not valid JSON, so it will throw a ValidationError with the field set to "body" and a message indicating that the JSON is invalid.
function parseJson(text) {
  if (typeof text !== "string") {
    throw new ValidationError("JSON text must be a string", "body");
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError(`Invalid JSON: ${error.message}`, "body", {
        cause: error,
      });
    }
    throw error; // rethrow any other unexpected errors
  }
}

checkList("2a an object", parseJson('{"amount":5000}'), { amount: 5000 });
checkList("2a spaces around it are fine", parseJson("  [1, 2] "), [1, 2]);
check("2a the text null is valid JSON", parseJson("null"), null);

const badJson = catchError(() => parseJson("{bad json"));
check("2b bad JSON: ValidationError", badJson instanceof ValidationError, true);
check("2b bad JSON: field", badJson.field, "body");
check("2b bad JSON: message", badJson.message.startsWith("Invalid JSON"), true);
check(
  "2b bad JSON: cause is the SyntaxError",
  badJson.cause instanceof SyntaxError,
  true
);

const emptyText = catchError(() => parseJson(""));
check("2c empty text: field", emptyText.field, "body");

const numberInput = catchError(() => parseJson(42));
check(
  "2d a number: ValidationError",
  numberInput instanceof ValidationError,
  true
);
check(
  "2d a number: message",
  numberInput.message,
  "JSON text must be a string"
);
const undefinedInput = catchError(() => parseJson(undefined));
check(
  "2d undefined: message",
  undefinedInput.message,
  "JSON text must be a string"
);

// ---------------------------------------------------------------
// Section 3: loadJson - read a file we own
// ---------------------------------------------------------------
// Test files for this section:
fs.writeFileSync(fileIn("good.json"), '[{"id":"tx_1","amount":5000}]');
fs.writeFileSync(fileIn("corrupt.json"), '[{"id":"tx_1",');
fs.writeFileSync(fileIn("empty.json"), "");

// 3a. Read this error before you write loadJson. Uncomment, run, comment out.
// const missingError = catchError(() => fs.readFileSync(fileIn("missing.json"), "utf8"));
// console.log(missingError.code, "|", missingError.message);
// What is .code? ENOENT

checkList("3b a good file", loadJson(fileIn("good.json"), []), [
  { id: "tx_1", amount: 5000 },
]);
checkList(
  "3c a missing file gives the fallback",
  loadJson(fileIn("missing.json"), []),
  []
);
check(
  "3c the fallback is returned as it is",
  loadJson(fileIn("missing.json"), null),
  null
);
check(
  "3c loadJson does not create the file",
  fs.existsSync(fileIn("missing.json")),
  false
);

const corrupt = catchError(() => loadJson(fileIn("corrupt.json"), []));
check("3d corrupt: is an Error", corrupt instanceof Error, true);
check(
  "3d corrupt: is NOT a ValidationError",
  corrupt instanceof ValidationError,
  false
);
check(
  "3d corrupt: message",
  corrupt.message.startsWith("Corrupt JSON in"),
  true
);
check(
  "3d corrupt: message names the file",
  corrupt.message.includes("corrupt.json"),
  true
);
check(
  "3d corrupt: cause is the SyntaxError",
  corrupt.cause instanceof SyntaxError,
  true
);

const empty = catchError(() => loadJson(fileIn("empty.json"), []));
check(
  "3e an empty file is corrupt, not missing",
  empty.message.startsWith("Corrupt JSON in"),
  true
);

// A folder is not a missing file. That read error must escape unchanged.
const folder = catchError(() => loadJson(DIR, []));
check("3f reading a folder: the error escapes", folder.code, "EISDIR");

// ---------------------------------------------------------------
// Section 4: saveJson - write a file, and never write nothing
// ---------------------------------------------------------------

const saved = fileIn("saved.json");
check(
  "4a returns nothing",
  saveJson(saved, [{ id: "tx_1", amount: 5000 }]),
  undefined
);
check(
  "4a exact file text",
  fs.readFileSync(saved, "utf8"),
  '[\n  {\n    "id": "tx_1",\n    "amount": 5000\n  }\n]\n'
);
checkList("4b round trip with loadJson", loadJson(saved, []), [
  { id: "tx_1", amount: 5000 },
]);

saveJson(saved, []);
check(
  "4c saving again replaces the file",
  fs.readFileSync(saved, "utf8"),
  "[]\n"
);

const saveUndefined = catchError(() => saveJson(saved, undefined));
check(
  "4d undefined: refused",
  saveUndefined.message.startsWith("Nothing to save"),
  true
);
const saveFunction = catchError(() => saveJson(saved, () => 1));
check(
  "4d a function: refused",
  saveFunction.message.startsWith("Nothing to save"),
  true
);
check(
  "4d ...and the old file is untouched",
  fs.readFileSync(saved, "utf8"),
  "[]\n"
);

const dated = fileIn("dated.json");
saveJson(dated, { paidAt: new Date("2026-11-06T09:30:00Z") });
check(
  "4e a Date comes back as an ISO string",
  loadJson(dated, null).paidAt,
  "2026-11-06T09:30:00.000Z"
);

// ---------------------------------------------------------------
// Section 5: recordTransaction - load, check, change, save
// ---------------------------------------------------------------
// Already written for you. Read it and its contract before Exercise 5.
// Input: anything.
// Output: a new object with exactly { id, amount, status }, status normalized.
// Empty: undefined is not an object, so it throws (field "input").
// Bad input: throws a ValidationError naming the first bad field, checked
// in this order: input, id, amount, status.
function validateTransaction(input) {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Transaction must be an object", "input");
  }
  const { id, amount } = input;
  if (typeof id !== "string" || id.trim() === "") {
    throw new ValidationError(`Invalid id: ${id}`, "id");
  }
  if (!isValidAmount(amount)) {
    throw new ValidationError(`Invalid amount: ${amount}`, "amount");
  }
  let status;
  try {
    status = normalizeStatus(input.status);
  } catch (error) {
    throw new ValidationError(`Invalid status: ${input.status}`, "status", {
      cause: error,
    });
  }
  return { id, amount, status };
}

// TODO (Exercise 5): contract, then body. Spec is in the plan.
// Input: a file path and a transaction object.
// Output: an object with { added, count } where added is true if the transaction was added, false if it was a duplicate, and count is the total number of transactions in the file after the operation.
// Bad Input: if the transaction is invalid, throw a ValidationError naming the first bad field. If the file exists but does not contain an array, throw an Error indicating that the file is not in the expected format. If the file exists but contains corrupt JSON, throw an Error indicating that the JSON is corrupt.
// Empty Input: if the file does not exist, it is created with the new transaction as the first entry. If the file exists but is empty, it is considered corrupt and will throw an Error indicating that the JSON is corrupt.
function recordTransaction(filePath, input) {
  const tx = validateTransaction(input);

  const list = loadJson(filePath, []);

  if (!Array.isArray(list)) {
    throw new Error(`Expected an array in ${filePath}`);
  }

  if (list.some((item) => item.id === tx.id)) {
    return { added: false, count: list.length };
  }

  list.push(tx);
  saveJson(filePath, list);
  return { added: true, count: list.length };
}

const ledger = fileIn("ledger.json");

// 5a. First transaction creates the file.
checkList(
  "5a first",
  recordTransaction(ledger, { id: "tx_1", amount: 5000, status: "succeeded" }),
  { added: true, count: 1 }
);
check("5a the file now exists", fs.existsSync(ledger), true);

// 5b. Second transaction is added, and stored normalized.
const second = recordTransaction(ledger, {
  id: "tx_2",
  amount: 2500,
  status: " PENDING ",
});
checkList("5b second", second, { added: true, count: 2 });
checkList(
  "5b statuses on disk",
  loadJson(ledger, []).map((t) => t.status),
  ["succeeded", "pending"]
);

// 5c. The same id again is a duplicate: not an error, nothing changes.
checkList(
  "5c duplicate",
  recordTransaction(ledger, { id: "tx_1", amount: 5000, status: "succeeded" }),
  { added: false, count: 2 }
);
checkList(
  "5c duplicate with a different amount",
  recordTransaction(ledger, { id: "tx_1", amount: 9999, status: "succeeded" }),
  { added: false, count: 2 }
);
check(
  "5c tx_1 still has its first amount",
  loadJson(ledger, []).find((t) => t.id === "tx_1").amount,
  5000
);

// 5d. Bad input is refused and the ledger is unchanged.
const badAmount = catchError(() =>
  recordTransaction(ledger, { id: "tx_3", amount: -1, status: "pending" })
);
check(
  "5d bad amount: ValidationError",
  badAmount instanceof ValidationError,
  true
);
check("5d bad amount: field", badAmount.field, "amount");
check("5d ledger still has 2", loadJson(ledger, []).length, 2);

// 5e. Bad input must not create a file (validate BEFORE touching the disk).
const never = fileIn("never.json");
catchError(() => recordTransaction(never, { id: "tx_1", amount: -1 }));
check("5e no file created for bad input", fs.existsSync(never), false);
// Bad input AND a corrupt file: the caller's mistake is reported first.
const bothBad = catchError(() =>
  recordTransaction(fileIn("corrupt.json"), { id: "", amount: 100 })
);
check("5e validate before reading: field", bothBad.field, "id");

// 5f. A file that holds JSON, but not an array.
fs.writeFileSync(fileIn("object.json"), '{"id":"tx_1"}');
const wrongShape = catchError(() =>
  recordTransaction(fileIn("object.json"), {
    id: "tx_9",
    amount: 100,
    status: "pending",
  })
);
check(
  "5f not an array: message",
  wrongShape.message.startsWith("Expected an array in"),
  true
);
check(
  "5f not an array: NOT a ValidationError",
  wrongShape instanceof ValidationError,
  false
);

// 5g. A corrupt ledger must NOT be "fixed" by overwriting it.
const corruptLedger = catchError(() =>
  recordTransaction(fileIn("corrupt.json"), {
    id: "tx_9",
    amount: 100,
    status: "pending",
  })
);
check(
  "5g corrupt ledger: refused",
  corruptLedger.message.startsWith("Corrupt JSON in"),
  true
);
check(
  "5g corrupt ledger: file untouched",
  fs.readFileSync(fileIn("corrupt.json"), "utf8"),
  '[{"id":"tx_1",'
);

// Independent self-check: the count recordTransaction reported when it last
// added (5b) must match what is actually on disk now.
check(
  "5h reported count = records on disk",
  loadJson(ledger, []).length,
  second.count
);

// ---------------------------------------------------------------
// Section 6: Think (comments only). Questions are in the plan.
// ---------------------------------------------------------------
// 1. Process A loads [tx_1, tx_2] and is about to add tx_5.
// Process B loads [tx_1, tx_2] and is about to add tx_6. Both processes validate their transactions, then both write their new arrays back to the file.
// At the end it will contain either [tx_1, tx_2, tx_5] or [tx_1, tx_2, tx_6], depending on which process writes last. The other transaction will be lost with no error.
//
// 2. Quietly ignoring duplicates with a different amount is wrong for data integrity.
// Reusing an idempotency key with different parameters is a caller bug (like Stripe's idempotency_replay error).
// The function should throw a ValidationError (or return a 400 error) so the caller knows immediately that they made a mistake, rather than just logging a quiet warning.
//
// 3. If the power goes off while the file is being written,
// ledger.json could be empty or half-written JSON.
// On the next run, JSON.parse throws a SyntaxError,
// but loadJson catches it and throws a generic Error with the message "Corrupt JSON in ...",
// keeping the original SyntaxError in the cause property.
// Writing to ledger.json.tmp first and then renaming it to ledger.json is safer because the rename operation is atomic; whatever happens, the file is either the complete old version or the complete new one.
//
// 4. JSON.parse will throw a SyntaxError in both cases.
// The difference is who owns the data. If the caller sent it, it is a 400 Bad Request (their mistake).
// If we wrote it, it is a 500 Internal Server Error (our mistake). For a 500, we must only return a generic "internal error" message to the caller to avoid leaking internal file paths and system details to attackers;
// the actual file path and SyntaxError must be logged server-side.
//
// 5. If loadJson silently returned [] for a corrupt 10,000-record ledger,
// recordTransaction would push the new transaction into an empty array and save [{ new_tx }] to disk,
// completely overwriting and destroying the original 10,000 records.
// Throwing an error forces the program to stop, preserving the corrupt file on disk so a developer can investigate and recover the data instead of silently losing it.
