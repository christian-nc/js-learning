// Week 3, Day 3 - try/catch/finally and custom errors
// Plan and reading list: day13-plan.md
// Run with: node exercises13.js
//
// Do Exercise 0 (lint clean-up) from the plan first. Then work down this file.
// Sections you haven't reached yet will crash, usually with
// "Error: TODO: write <name>". Read WHICH name: it tells you where you are.

const { check, checkList, checkThrows, catchError } = require("./lib/testing");
const { isValidAmount } = require("./lib/money");
const { normalizeStatus } = require("./lib/status");

// ---------------------------------------------------------------
// Section 1: Predict the flow (nothing to write except predictions)
// ---------------------------------------------------------------
// For each function, write your predicted array in the comment BEFORE you
// run the file. The expected values in the tests are correct; if your
// prediction was wrong, write one sentence on why under it.

function flow(shouldThrow) {
  const log = [];
  try {
    log.push("try start");
    if (shouldThrow) throw new Error("boom");
    log.push("try end");
  } catch (error) {
    log.push(`catch ${error.message}`);
  } finally {
    log.push("finally");
  }
  log.push("after");
  return log;
}

// 1a. Prediction for flow(false): [ 'try start', 'try end', 'finally', 'after' ]
// 1b. Prediction for flow(true):  [ 'try start', 'catch boom', 'finally', 'after' ]
checkList("1a flow(false)", flow(false), [
  "try start",
  "try end",
  "finally",
  "after",
]);
checkList("1b flow(true)", flow(true), [
  "try start",
  "catch boom",
  "finally",
  "after",
]);

function returnInTry() {
  const log = [];
  try {
    log.push("try");
    return log;
  } finally {
    log.push("finally");
  }
}

// 1c. Prediction for returnInTry(): [ 'try', 'finally']
// (Hint for afterwards: Week 2, arrays are passed by reference.)
checkList("1c returnInTry()", returnInTry(), ["try", "finally"]);

function throwInCatch() {
  const log = [];
  try {
    try {
      throw new Error("first");
    } catch (error) {
      log.push(`inner catch ${error.message}`);
      throw new Error("second", { cause: error });
    } finally {
      log.push("inner finally");
    }
  } catch (error) {
    log.push(`outer catch ${error.message}`);
  }
  return log;
}

// 1d. Prediction for throwInCatch(): [ 'inner catch first', 'inner finally', 'outer catch second' ]
checkList("1d throwInCatch()", throwInCatch(), [
  "inner catch first",
  "inner finally",
  "outer catch second",
]);

// ---------------------------------------------------------------
// Section 2: catchError and the error object
// ---------------------------------------------------------------
// TODO (Exercise 2): write the contract (4 lines), then the body.
// Spec is in the plan. Delete the "throw new Error('TODO...')" line.

check(
  "2a TypeError",
  catchError(() => {
    const payment = undefined;
    return payment.amount;
  }).name,
  "TypeError"
);
check(
  "2b SyntaxError from bad JSON",
  catchError(() => JSON.parse("{bad json")).name,
  "SyntaxError"
);
check("2c RangeError", catchError(() => (1).toFixed(200)).name, "RangeError");
check("2d nothing thrown", catchError(() => 42).name, "NoError");
check(
  "2e the error is returned, not just its name",
  catchError(() => JSON.parse("{bad json")) instanceof SyntaxError,
  true
);

// 2f. Read a stack trace. Uncomment, run, then comment out again.
// console.log(catchError(() => (1).toFixed(200)).stack);
// Which line of THIS file does the stack point to? line 127
// What is the first line of the stack (the header)? RangeError: toFixed() digits argument must be between 0 and 100

// 2g. Throwing something that isn't an Error.
const thrownString = catchError(() => {
  // eslint-disable-next-line no-throw-literal
  throw "card declined";
});
check(
  "2g a thrown string comes back as a string",
  thrownString,
  "card declined"
);
check("2g ...and it has no .name", thrownString.name, undefined);
// Why does a thrown string have no .stack? What does that cost you when
// debugging a failed payment at 2am?
// Answer: It forces you to debug without a stack trace, making it harder to trace the source of the error and understand the context in which it occurred,
// especially during critical times like 2am when quick resolution is needed.

// ---------------------------------------------------------------
// Section 3: checkThrows survives non-Error throws (edit lib/testing.js)
// ---------------------------------------------------------------
// Your own contract comment in lib/testing.js says checkThrows crashes if
// fn throws a string. Fix it there. Nothing to write in this file.

const stringRight = checkThrows(
  "3a string throw, right text",
  () => {
    // eslint-disable-next-line no-throw-literal
    throw "card declined";
  },
  "declined"
);
check("3a helper returned true", stringRight, true);

// This FAIL line from the helper is expected:
const stringWrong = checkThrows(
  "3b string throw, wrong text (FAIL expected)",
  () => {
    // eslint-disable-next-line no-throw-literal
    throw "card declined";
  },
  "Invalid amount"
);
check("3b helper returned false", stringWrong, false);

const undefinedNoText = checkThrows("3c throw undefined, no text", () => {
  // eslint-disable-next-line no-throw-literal
  throw undefined;
});
check("3c helper returned true", undefinedNoText, true);

// ---------------------------------------------------------------
// Section 4: lib/errors.js and toHttpStatus
// ---------------------------------------------------------------
// TODO (Exercise 4): require ValidationError and ProviderError from
// lib/errors.js here.
const { ValidationError, ProviderError } = require("./lib/errors");

checkList(
  "4a errors.js exports exactly two names",
  Object.keys(require("./lib/errors")).sort(),
  ["ProviderError", "ValidationError"]
);

const v = new ValidationError("Invalid amount: -5", "amount");
check("4b is a ValidationError", v instanceof ValidationError, true);
check("4b is also an Error", v instanceof Error, true);
check("4b name", v.name, "ValidationError");
check("4b message", v.message, "Invalid amount: -5");
check("4b field", v.field, "amount");
check(
  "4b stack header uses the new name",
  v.stack.startsWith("ValidationError: Invalid amount: -5"),
  true
);

const original = new Error("Unknown transaction status: refunded");
const wrapped = new ValidationError("Invalid status: refunded", "status", {
  cause: original,
});
check("4c cause is kept", wrapped.cause, original);

const p = new ProviderError("Paystack timed out", "paystack");
check("4d name", p.name, "ProviderError");
check("4d provider", p.provider, "paystack");
check(
  "4d a ProviderError is not a ValidationError",
  p instanceof ValidationError,
  false
);

// TODO (Exercise 4): contract, then body. Spec is in the plan.
// Input: error (any) - The error object or value that was caught. It can be a ValidationError, ProviderError, a standard Error, a primitive (string, number), null, or undefined.
// Output: number - An HTTP status code corresponding to the type of error. Returns 400 for ValidationError, 502 for ProviderError, and 500 for any other error or value.
// Bad Input: none - The function should handle any input gracefully, including undefined, null, or non-error values, and return the appropriate HTTP status code.
// Empty: N/A - There is no concept of an "empty" input in this context; all inputs are treated as errors or non-errors.
function toHttpStatus(error) {
  // 1. Check if it is a user's input mistake (ValidationError) and return 400
  if (error instanceof ValidationError) {
    return 400; // Bad Request
  }

  // 2. Check if it is a provider issue (ProviderError)
  if (error instanceof ProviderError) {
    return 502; // Bad Gateway
  }

  // 3. Catch-all for ANYTHING else (including undefined, null, strings, or generic Errors)
  return 500; // Internal Server Error
}

check("4e ValidationError -> 400", toHttpStatus(v), 400);
check("4e ProviderError -> 502", toHttpStatus(p), 502);
check("4e TypeError -> 500", toHttpStatus(new TypeError("oops")), 500);
check("4e a thrown string -> 500", toHttpStatus("card declined"), 500);
check("4e undefined -> 500", toHttpStatus(undefined), 500);

// ---------------------------------------------------------------
// Section 5: validatePayment
// ---------------------------------------------------------------
// TODO (Exercise 5): contract, then body. Spec is in the plan.
// input: input (object) - The payment input object to validate. It should contain the fields 'amount', 'currency', and 'status'.
// output: object - A new object containing only the valid fields: 'amount', 'currency', and 'status'. The 'currency' field defaults to "NGN" if not provided, and the 'status' field is normalized.
// empty: If input is omitted, it becomes undefined. This safely triggers Rule 1 and throws ValidationError("Payment input must be an object", "input")`.
// bad input: ValidationError - Thrown when the input is not an object, when the 'amount' is invalid, when the 'currency' is unsupported, or when the 'status' cannot be normalized. The error includes the specific field that caused the problem.

function validatePayment(input) {
  // Input must be an object, not null or an arrya
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new ValidationError("Payment input must be an object", "input");
  }

  // Amount must pass isValidAmount
  const amount = input.amount;
  if (!isValidAmount(amount)) {
    throw new ValidationError(`Invalid amount: ${amount}`, "amount");
  }

  // Currency must be "NGN" or undefined (default to "NGN")
  let currency = input.currency;
  if (currency === undefined) {
    currency = "NGN";
  }
  if (currency !== "NGN") {
    throw new ValidationError(
      `Unsupported currency: ${input.currency}`,
      "currency"
    );
  }

  // status must normalized with normalizeStatus. If normalizeStatus throws, catch it and throw a ValidationError with the original error as cause.
  let status;
  try {
    status = normalizeStatus(input.status);
  } catch (error) {
    throw new ValidationError(`Invalid status: ${input.status}`, "status", {
      cause: error,
    });
  }

  // Return a new object with only the valid fields
  return { amount, currency, status };
}

// 5a. Good input
checkList(
  "5a valid payment is normalized",
  validatePayment({ amount: 5000, currency: "NGN", status: " Succeeded " }),
  { amount: 5000, currency: "NGN", status: "succeeded" }
);
checkList(
  "5a missing currency defaults to NGN",
  validatePayment({ amount: 100, status: "pending" }),
  { amount: 100, currency: "NGN", status: "pending" }
);
checkList(
  "5a extra fields are dropped",
  validatePayment({ amount: 100, status: "pending", isAdmin: true, fee: 0 }),
  { amount: 100, currency: "NGN", status: "pending" }
);

// 5b. Bad input: each must throw a ValidationError with the right field.
const nullInput = catchError(() => validatePayment(null));
check("5b null: ValidationError", nullInput instanceof ValidationError, true);
check("5b null: field", nullInput.field, "input");

const arrayInput = catchError(() => validatePayment([5000, "NGN"]));
check("5b array: field", arrayInput.field, "input");

const stringAmount = catchError(() =>
  validatePayment({ amount: "5000", status: "pending" })
);
check("5b string amount: field", stringAmount.field, "amount");
check(
  "5b string amount: message",
  stringAmount.message.includes("Invalid amount"),
  true
);

const negativeAmount = catchError(() =>
  validatePayment({ amount: -1, status: "pending" })
);
check("5b negative amount: field", negativeAmount.field, "amount");

const usd = catchError(() =>
  validatePayment({ amount: 100, currency: "USD", status: "pending" })
);
check("5b USD: field", usd.field, "currency");
check("5b USD: message", usd.message.includes("Unsupported currency"), true);

const nullCurrency = catchError(() =>
  validatePayment({ amount: 100, currency: null, status: "pending" })
);
check(
  "5b null currency is rejected (not defaulted)",
  nullCurrency.field,
  "currency"
);

// 5c. Wrapping: normalizeStatus throws a plain Error. validatePayment must
// turn it into a ValidationError and keep the original as `cause`.
const refunded = catchError(() =>
  validatePayment({ amount: 100, status: "refunded" })
);
check(
  "5c refunded: ValidationError",
  refunded instanceof ValidationError,
  true
);
check("5c refunded: field", refunded.field, "status");
check(
  "5c refunded: message",
  refunded.message.includes("Invalid status"),
  true
);
check("5c refunded: cause is an Error", refunded.cause instanceof Error, true);
check(
  "5c refunded: cause is normalizeStatus's error",
  refunded.cause.message.includes("Unknown transaction status"),
  true
);

const missingStatus = catchError(() => validatePayment({ amount: 100 }));
check("5c missing status: field", missingStatus.field, "status");

// 5d. Two problems at once: the first rule in the order wins.
const twoProblems = catchError(() =>
  validatePayment({ amount: -1, currency: "USD", status: "pending" })
);
check("5d amount is checked before currency", twoProblems.field, "amount");

// ---------------------------------------------------------------
// Section 6: processBatch - catch only what you can handle
// ---------------------------------------------------------------
// TODO (Exercise 6): contract, then body. Spec is in the plan.
// input: inputs (array) - An array of payment input objects to be processed. Each object should contain the fields 'amount', 'currency', and 'status'.
//        validate (function) - An optional validation function to validate each payment input. Defaults to the validatePayment function defined earlier. It should throw a ValidationError for invalid inputs.
// output: object - An object containing two arrays: 'accepted' and 'rejected'. The 'accepted' array contains the results of successfully validated payments, while the 'rejected' array contains objects with the index, field, and message of each rejected payment input.
// bad input: ValidationError - Thrown when the 'inputs' parameter is not an array. The error includes the specific field that caused the problem ('inputs').
// empty: If 'inputs' is an empty array, both 'accepted' and 'rejected' arrays will be empty in the returned object.
function processBatch(inputs, validate = validatePayment) {
  if (!Array.isArray(inputs)) {
    throw new ValidationError("Payment inputs must be an array", "inputs");
  }

  const accepted = [];
  const rejected = [];

  for (let index = 0; index < inputs.length; index++) {
    try {
      const result = validate(inputs[index]);
      accepted.push(result);
    } catch (error) {
      if (error instanceof ValidationError) {
        rejected.push({ index, field: error.field, message: error.message });
      } else {
        throw error; // Re-throw any other errors (like TypeError, ReferenceError, etc.)
      }
    }
  }
  return { accepted, rejected };
}

const batch = [
  { amount: 5000, status: "succeeded" },
  { amount: -1, status: "succeeded" },
  { amount: 2000, status: "refunded" },
  null,
  { amount: 750, currency: "NGN", status: "PENDING" },
];
const result = processBatch(batch);

checkList(
  "6a accepted amounts",
  result.accepted.map((payment) => payment.amount),
  [5000, 750]
);
checkList(
  "6a rejected indexes",
  result.rejected.map((r) => r.index),
  [1, 2, 3]
);
checkList(
  "6a rejected fields",
  result.rejected.map((r) => r.field),
  ["amount", "status", "input"]
);
check(
  "6a every rejection has a message",
  result.rejected.every(
    (r) => typeof r.message === "string" && r.message !== ""
  ),
  true
);
// Independent self-check: every input ends up in exactly one list.
check(
  "6a accepted + rejected = inputs",
  result.accepted.length + result.rejected.length,
  batch.length
);

checkList("6b empty batch", processBatch([]), { accepted: [], rejected: [] });

const notAnArray = catchError(() => processBatch("nope"));
check(
  "6c not an array: ValidationError",
  notAnArray instanceof ValidationError,
  true
);
check("6c not an array: field", notAnArray.field, "inputs");

// 6d. A bug in the validator is NOT a bad input. It must not be hidden in
// `rejected`; it must escape processBatch.
const buggyValidator = () => {
  const payment = undefined;
  return payment.amount;
};
const bug = catchError(() => processBatch([{ amount: 100 }], buggyValidator));
check("6d the TypeError escapes", bug.name, "TypeError");

// ---------------------------------------------------------------
// Section 7: withLock - finally for cleanup
// ---------------------------------------------------------------
// A pretend lock: while an account id is in this Set, nobody else may
// spend from that account. (The real thing is a database row lock, Phase 3.)
const lockedAccounts = new Set();
function isLocked(accountId) {
  return lockedAccounts.has(accountId);
}

// TODO (Exercise 7): contract, then body. Spec is in the plan.
// input: accountId (string) - The unique identifier of the account to lock. It should be a non-empty string representing the account ID.
//        fn (function) - A function to execute while the account is locked. It should contain the logic that requires exclusive access to the account. It can return any value or throw an error.
// output: any - The return value of the function 'fn' if it executes successfully. If 'fn' throws an error, that error will be propagated to the caller of 'withLock'.
// bad input: Error - Thrown if the account is already locked when 'withLock' is called. The error message will indicate that the account is already locked.
// empty: - If `fn` is omitted, it becomes `undefined`. The lock is acquired, then calling `undefined()`
//       throws a `TypeError`. The `finally` block ensures the lock is safely released before the error escapes.
//       - If `accountId` is omitted, it becomes `undefined`, which may be treated as a valid (but likely unintended) lock key.
function withLock(accountId, fn) {
  // Check whether the account is already locked.
  if (isLocked(accountId)) {
    throw new Error(`Account ${accountId} is already locked.`);
  }

  // Add the lock.
  lockedAccounts.add(accountId);

  try {
    // Call fn and return its result.
    return fn();
  } finally {
    // Release the lock.
    lockedAccounts.delete(accountId);
  }
}

// 7a. Returns fn's result and releases the lock.
check(
  "7a returns fn's result",
  withLock("acct-1", () => 5),
  5
);
check("7a released afterwards", isLocked("acct-1"), false);
check(
  "7a locked while fn runs",
  withLock("acct-1", () => isLocked("acct-1")),
  true
);

// 7b. fn throws: the SAME error comes out, and the lock is still released.
const thrownInside = catchError(() =>
  withLock("acct-1", () => {
    throw new ValidationError("Invalid amount: -1", "amount");
  })
);
check(
  "7b the error is not swallowed",
  thrownInside instanceof ValidationError,
  true
);
check("7b released after an error", isLocked("acct-1"), false);

// 7c. A second caller must not get in, and must not release the first
// caller's lock on its way out.
let innerError;
let stillLockedInside;
withLock("acct-2", () => {
  innerError = catchError(() => withLock("acct-2", () => "should not run"));
  stillLockedInside = isLocked("acct-2");
});
check(
  "7c second caller refused",
  innerError.message.includes("already locked"),
  true
);
check("7c first caller still holds the lock", stillLockedInside, true);
check("7c released after the first caller finishes", isLocked("acct-2"), false);

// ---------------------------------------------------------------
// Section 8: Think (comments only). Questions are in the plan.
// ---------------------------------------------------------------
// 1. The merchant will see a list of rejected payments with unclear javascript errors instead of
// clear business messages like Invalid amount.
// I, the developer will never find out the actual bug in the code because the error is swallowed and replaced with a generic ValidationError.
// Making it hard to debug
//
// 2. Returning false is better for when the function is not that important. It is fast and easy to use in simple conditional logic.
// Throwing an error is better for important business rules and contracts enforcement because it halts execution and
// prevents further processing of invalid data, ensuring that the system remains in a valid state. It also provides more information about the nature of the problem through the error message and stack trace.
//
// 3. The merchants will ship goods or provide services without actually receiving money
// The database records will show inconsistencies like order is paid while the payment failed
// console.log isn't an alert. Nobody reads that line, so the bug can run for weeks before anyone notices.
//
// 4. If the isLocked check is placed inside the try block and throws an error, the finally block will still execute
// It will release the lock belonging to another call who is still using the lock
// by checking before try, it ensures that you only enter try .. finally if you initiated the lock yourself.
//
// 5. unknown whether the charge failed
// Gateway issues like this will throw a ProviderError.
// Status will be 502 Bad Gateway, indicated by toHttpStatus for a ProviderError.
// The payment might have actually gone through and telling customer it failed might lead to them trying again.
// Tell the customer the payment is "processing", then check the result with Paystack (its verify endpoint, or the webhook) before anyone retries. Idempotency keys in Phase 4 make a retry safe.
