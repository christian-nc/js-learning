// Week 3, Day 1 - destructuring, spread/rest, template strings
// Plan and reading list: day11-plan.md
// Run with: node exercises11.js
// Do Exercise 0 (ESLint setup) from the plan first.

// Same helpers as before. check uses === on purpose (no type coercion).
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// Compares arrays AND objects as JSON text. Key order must match.
function checkList(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  console.log(
    `${a === e ? "PASS" : "FAIL"} - ${label} (got ${a}, expected ${e})`
  );
}

// Prints the error message so you can see WHY it threw. Read it every time.
function checkThrows(testName, fn) {
  try {
    fn();
    console.log(`FAIL - ${testName} (expected to throw, but it did not)`);
    return false;
  } catch (error) {
    console.log(`PASS - ${testName} (threw: "${error.message}")`);
    return true;
  }
}

// Your own rules from earlier weeks. This is the LAST time they get copied:
// tomorrow (modules) you'll load them from library.js instead.
const MAX_KOBO = 99900000000000;

const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

const formatNaira = (kobo) => {
  if (kobo !== 0 && !isValidAmount(kobo)) {
    throw new Error("Invalid kobo amount for formatting");
  }
  return "₦" + (kobo / 100).toFixed(2);
};

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

// ---------------------------------------------------------------
// Exercise 1 (10 min): warm-up, predict what destructuring gives you
// Read this, write your prediction for a) to f) in a comment, THEN uncomment
// the console.log lines one at a time and run.

const payment = {
  reference: "PAY-001",
  amount: 250000,
  currency: null,
  customer: { email: "ada@example.com", name: "Ada" },
};

const {
  reference,
  amount,
  currency = "NGN",
  fee = 0,
  customer: { email },
} = payment;

// a) PAY-001
console.log(reference);
// b) 250000
console.log(amount);
// c) null
console.log(currency); // careful: payment.currency exists, but it's null
// d) 0
console.log(fee); // payment has no fee key at all
// e) ada@example.com
console.log(email);
// f) const { customer: { email } } = payment creates a variable called email not customer.
//console.log(customer);       // read the error message. Why does this happen?
// Predictions:
// Error message is because there is no variable called customer
// After running: which predictions were wrong, and why?
// All my predictions were correct

// ---------------------------------------------------------------
// Exercise 2 (20 min, hardest today): parseProviderPayment(response)
// A payment provider sends you this shape. Note the snake_case names and the
// provider's own status words.

const providerSuccess = {
  data: {
    reference: "PSK-123",
    amount: 750000,
    status: "success",
    currency: "NGN",
    paid_at: "2026-10-28T09:15:00.000Z",
  },
};

// Write parseProviderPayment(response). It returns YOUR shape, with keys in
// exactly this order:
//   { reference, amountKobo, status, paidAt }
// Rules:
//   - Use destructuring to pull the fields out of response.data, renaming
//     amount -> amountKobo and paid_at -> paidAt while you destructure.
//   - Provider "success" becomes "succeeded"; "failed" stays "failed".
//     Any other status throws, and the message includes the bad status.
//   - amountKobo must pass isValidAmount, otherwise throw.
//   - If response has no data object, throw YOUR OWN message (for example
//     "Provider response has no data"). If you see "Cannot destructure..."
//     or "Cannot read properties of undefined" in the test output, the test
//     passed for the wrong reason. Hint: check before you destructure.
//
// Contract:
// Input: An object representing the payment provider's response.
// Output: { reference, amountKobo, status, paidAt }, in that order.
// Empty: Throws "provider response has no data" if the response
// is missing, invalid, or has no valid data object.
// Bad input: Throws if reference is missing, not a string, or blank.
// Throws if status is not "success" or "failed", including the bad status
// in the error. Throws if amountKobo fails isValidAmount.

// Write parseProviderPayment here.
const parseProviderPayment = (response) => {
  if (
    !response ||
    typeof response !== "object" ||
    Array.isArray(response) ||
    !response.data ||
    typeof response.data !== "object" ||
    Array.isArray(response.data)
  ) {
    throw new Error("provider response has no data");
  }

  const {
    reference,
    amount: amountKobo,
    status,
    paid_at: paidAt,
  } = response.data;

  // A payment must have a usable reference.
  if (typeof reference !== "string" || reference.trim() === "") {
    throw new Error("Provider payment has no reference");
  }

  if (status !== "success" && status !== "failed") {
    throw new Error(`Invalid status: ${status}`);
  }

  if (!isValidAmount(amountKobo)) {
    throw new Error("Invalid kobo amount");
  }

  const parsedStatus = status === "success" ? "succeeded" : "failed";

  return {
    reference: reference.trim(),
    amountKobo,
    status: parsedStatus,
    paidAt,
  };
};

// Tests. Uncomment once your function exists.
checkList("success maps to succeeded", parseProviderPayment(providerSuccess), {
  reference: "PSK-123",
  amountKobo: 750000,
  status: "succeeded",
  paidAt: "2026-10-28T09:15:00.000Z",
});
check(
  "failed stays failed",
  parseProviderPayment({ data: { ...providerSuccess.data, status: "failed" } })
    .status,
  "failed"
);
checkThrows("unknown status 'abandoned' throws", () =>
  parseProviderPayment({
    data: { ...providerSuccess.data, status: "abandoned" },
  })
);
checkThrows("amount as a string throws", () =>
  parseProviderPayment({ data: { ...providerSuccess.data, amount: "750000" } })
);
checkThrows("response with no data throws your own message", () =>
  parseProviderPayment({})
);
checkThrows("response with null data", () => {
  parseProviderPayment({ data: null });
});
checkThrows("response with string data", () => {
  parseProviderPayment({ data: "oops" });
});
checkThrows("null response", () => {
  parseProviderPayment(null);
});
checkThrows("missing provider reference throws", () =>
  parseProviderPayment({
    data: { ...providerSuccess.data, reference: undefined },
  })
);

checkThrows("blank provider reference throws", () =>
  parseProviderPayment({
    data: { ...providerSuccess.data, reference: "   " },
  })
);
// // (The tests use { ...providerSuccess.data, status: "failed" } to make a copy with one field changed. That's spread, Exercise 5. Can you already read it?)

// ---------------------------------------------------------------
// Exercise 3 (10 min): createCharge, destructuring in the parameter list
// createCharge({ amount, currency = "NGN", description = "" })
// returns { amount, currency, description, status: "pending" } (in that order)
// and throws if amount fails isValidAmount.
//
// a) Write it WITHOUT "= {}" after the parameter first. Run the
//    checkThrows("no argument at all", ...) test below and copy the message here:
//    Message: Cannot destructure property 'amount' of 'undefined' as it is undefined.
// b) Now add "= {}" after the parameter: ({ amount, ... } = {}). Run again.
//    Message now: no argument at all (threw: "Invalid amount: must be a valid kobo amount")
//    Which message would you rather see in a log at 2am, and why? I will prefer the second message
// because it explained the reason and so you can easily correct it.
//
// Contract:
// Input: An options object containing amount, and optionally currency (string) and description (string)
// Output: An object with keys in exactly this order: { amount, currency, description, status }, where status is always "pending".
// Empty: If called with no arguments or an empty object ({}), it throws an "Invalid amount" error because amount will be undefined and fail isValidAmount.
// Bad input: throws an error if amount is missing, not a number, or fails isValidAmount

// Write createCharge here.
const createCharge = ({ amount, currency = "NGN", description = "" } = {}) => {
  if (!isValidAmount(amount)) {
    throw new Error("Invalid amount: must be a valid kobo amount");
  }
  return { amount, currency, description, status: "pending" };
};

checkList("defaults fill in", createCharge({ amount: 50000 }), {
  amount: 50000,
  currency: "NGN",
  description: "",
  status: "pending",
});
checkThrows("no argument at all", () => createCharge());
checkThrows("amount 0 throws", () => createCharge({ amount: 0 }));
// c) A caller tries to sneak in a status. It must NOT work:
check(
  "caller cannot set status",
  createCharge({ amount: 50000, status: "succeeded" }).status,
  "pending"
);
//    Why does this pass without you writing any special code for it?
//    Answer: Because the status was set to pending in the function and the function only reads the input it needs, assigns others itself

// ---------------------------------------------------------------
// Exercise 4 (10 min): parseCsvLine, array destructuring and rest
// One line of a settlement file: "PAY-002,120000,succeeded"
// parseCsvLine(line) returns { reference, amount, status } with amount as a NUMBER.
// Rules:
//   - Use array destructuring on line.split(","), with a rest element to catch
//     extra columns: const [reference, amountText, status, ...extra] = ...
//   - Exactly 3 columns, otherwise throw (too few OR too many).
//   - amount must pass isValidAmount (remember: Number("") is 0).
//
// Contract:
// Input: A string representing a single CSV line (e.g., "PAY-002,120000,succeeded").
// Output: An object with keys in exactly this order: { reference, amount, status }, where amount is a Number
// Empty: If line is "" or missing, split yields [""] or throws. amountText and status become undefined, triggering error.
// Bad input: Throws if the input is not a string, if there are not exactly 3 comma-separated columns, or if the parsed amount fails isValidAmount

// Write parseCsvLine here.
const parseCsvLine = (line) => {
  if (typeof line !== "string") {
    throw new Error("Input must be a string");
  }

  const [referenceText, amountText, statusText, ...extra] = line.split(",");

  if (
    amountText === undefined ||
    statusText === undefined ||
    extra.length > 0
  ) {
    throw new Error("Expected exactly 3 columns");
  }

  const reference = referenceText.trim();

  if (reference === "") {
    throw new Error("Reference must not be empty");
  }

  const amount = Number(amountText);

  if (!isValidAmount(amount)) {
    throw new Error("Invalid amount: must be a valid kobo amount");
  }

  const status = normalizeStatus(statusText);

  return { reference, amount, status };
};

checkList("normal line", parseCsvLine("PAY-002,120000,succeeded"), {
  reference: "PAY-002",
  amount: 120000,
  status: "succeeded",
});
checkThrows("missing status column", () => parseCsvLine("PAY-003,5000"));
checkThrows("extra column", () => parseCsvLine("PAY-004,5000,failed,extra"));
checkThrows("empty amount", () => parseCsvLine("PAY-005,,failed"));
checkThrows("empty reference throws", () => parseCsvLine(",120000,succeeded"));

checkThrows("whitespace-only reference throws", () =>
  parseCsvLine("   ,120000,succeeded")
);

// The Day 4 status rule trims whitespace and ignores letter case.
check(
  "CSV status normalizes case and spaces",
  parseCsvLine("PAY-006,120000, SUCCEEDED ").status,
  "succeeded"
);

checkThrows("unknown CSV status throws", () =>
  parseCsvLine("PAY-007,120000,refunded")
);
// Question: without the rest element, what would "PAY-004,5000,failed,extra"
// have returned? Why is that a silent wrong result?
// Answer: Javascript will ignore the extra column and parse only the 3 which is a silent wrong result and will make an error go unnoticed

// d) Predict, then run:
let first = "first";
let second = "second";
[first, second] = [second, first];
console.log(first, second);
// Prediction: second, first

// ---------------------------------------------------------------
// Exercise 5 (15 min): spread, copies, and the shallow-copy trap
// a) Predict all three values printed, then uncomment and run.
const original = {
  reference: "PAY-010",
  amount: 90000,
  status: "succeeded",
  customer: { email: "tolu@example.com" },
};

const copy = { ...original, status: "refunded" };
copy.amount = 1;
copy.customer.email = "changed@example.com";
console.log(original.status, original.amount, original.customer.email);
// Prediction: succeeded, 90000, changed@example.com
// Why did one of them change and the other two didn't?
// Answer: Only the email changed while original.amount and original.status did not. The email changed because the customer property hits the same nested object

// b) Predict, then run. Does the ORDER inside { } matter? Yes, it matters
console.log({ status: "refunded", ...original }.status);
// Prediction: succeeded because the original comes last hence will overwrite

// c) Write markRefunded(payment, refundedAt).
//   - Returns a NEW object: same fields, status "refunded", a NEW customer
//     object (copy it with spread too), and refundedAt added at the end.
//   - Throws if payment.status is not "succeeded" (you can't refund a payment
//     that never succeeded).
//   - Must not change the payment passed in. At all.
//   refundedAt is passed in (not new Date()) so the tests always get the same value.
//
// Contract:
// Input: A payment object must have a status and a customer object, and a refundedAt value
// Output:  new object containing all original fields, but with status updated to "refunded", a new customer object and refundedAt added at the end
// Empty: If payment is null, undefined, or missing required fields, it throws an error
// Bad input: Throws an error if payment.status is not exactly "succeeded"

const paid = {
  reference: "PAY-011",
  amount: 90000,
  status: "succeeded",
  customer: { email: "tolu@example.com" },
};

// Write markRefunded here.
const markRefunded = (payment, refundedAt) => {
  if (!payment || typeof payment !== "object" || Array.isArray(payment)) {
    throw new Error("Invalid payment object");
  }

  if (payment.status !== "succeeded") {
    throw new Error(`Cannot refund payment with status: ${payment.status}`);
  }

  if (
    !payment.customer ||
    typeof payment.customer !== "object" ||
    Array.isArray(payment.customer)
  ) {
    throw new Error("Invalid payment: customer must be an object");
  }

  return {
    ...payment,
    status: "refunded",
    customer: { ...payment.customer },
    refundedAt,
  };
};

const refunded = markRefunded(paid, "2026-10-28T10:00:00.000Z");
checkList("refunded copy", refunded, {
  reference: "PAY-011",
  amount: 90000,
  status: "refunded",
  customer: { email: "tolu@example.com" },
  refundedAt: "2026-10-28T10:00:00.000Z",
});
// (Look at the key order: status stays in 3rd place. Overwriting a key with
// spread keeps the key where it was.)
check("original status untouched", paid.status, "succeeded");
check("original has no refundedAt", paid.refundedAt, undefined);
check("customer is a new object", refunded.customer === paid.customer, false);
checkThrows("can't refund a refunded payment", () =>
  markRefunded(refunded, "2026-10-28T11:00:00.000Z")
);
checkThrows("missing customer throws", () =>
  markRefunded({ status: "succeeded", amount: 100 }, "2026-10-28T10:00:00.000Z")
);

checkThrows("null customer throws", () =>
  markRefunded(
    { status: "succeeded", customer: null },
    "2026-10-28T10:00:00.000Z"
  )
);
// d) Think (comment only). An API saves new payments like this:
//      const record = { status: "pending", amount: 0, ...requestBody };
//    A caller sends { "amount": 100, "status": "succeeded" }.
//    What gets saved? Why is that a security bug? it will save status as succeeded and amount as 100 which is a bug
//    cause the caller can mark a payment as succeeded without a verified successful
//    payment, so the merchant might ship goods or credit a customer's wallet
//    without actually receiving the money.
//    How did createCharge in
//    Exercise 3 avoid it? it avoids this by building the output from selected fields and setting the status

// e) Spread with Math.max. Predict, then run:
// 9000
console.log(Math.max(...[3000, 9000, 1500]));
// Nan but got -Infinity
console.log(Math.max(...[]));
// Which Week 2 Day 5 trap is the second one? the empty list max trap

// ---------------------------------------------------------------
// Exercise 6 (10 min): formatReceipt(receipt), template strings and padding
// Providers never give you the full card number, only the last 4 digits.
// That's on purpose: if you never have it, you can't leak it.
const receiptData = {
  reference: "PAY-011",
  email: "tolu@example.com",
  amount: 90000,
  cardLast4: "4081",
  status: "refunded",
};
// formatReceipt(receipt) returns ONE string (it does not print). Rules:
//   - First line is RECEIPT.
//   - Every other line: label.padEnd(11) followed by value.padStart(18).
//   - Amount uses formatNaira. Card is shown as "**** " + last 4.
//   - Use destructuring for the fields and a template string for the lines.
// Expected (6 lines):
// RECEIPT
// Reference             PAY-011
// Customer     tolu@example.com
// Amount                ₦900.00
// Card                **** 4081
// Status               refunded
//
// Hint: a small helper like row(label, value) saves repeating padEnd/padStart.
// Hint: join lines with "\n", or write one multi-line template string. Watch
// for spaces at the start of lines if you indent a multi-line template.

// Write formatReceipt here.
const formatReceipt = (receipt) => {
  const { reference, email, amount, cardLast4, status } = receipt;

  const row = (label, value) => label.padEnd(11) + value.padStart(18);

  return [
    "RECEIPT",
    row("Reference", reference),
    row("Customer", email),
    row("Amount", formatNaira(amount)),
    row("Card", `**** ${cardLast4}`),
    row("Status", status),
  ].join("\n");
};
check(
  "receipt text",
  formatReceipt(receiptData),
  "RECEIPT\nReference             PAY-011\nCustomer     tolu@example.com\nAmount                ₦900.00\nCard                **** 4081\nStatus               refunded"
);
console.log(formatReceipt(receiptData));

// ---------------------------------------------------------------
// Exercise 7 (5 min): think (comments only)
// 1. In Exercise 1, currency = "NGN" did not apply. A provider sometimes sends
//    "currency": null. What could go wrong if your code assumed the default
//    would cover it?
// Answer: // The default currency only applies when currency is undefined, not null.
// For example, currency.toUpperCase() throws a TypeError when currency is null.
// Silently replacing null with "NGN" is unsafe because the real payment could
// be in USD. The system could then record, convert, or settle the payment
// using the wrong currency. The currency should be validated rather than guessed.
//
// 2. Describe a payment bug that a shallow copy (Exercise 5a) could cause.
// Answer: If due to a shallow copy, I accidentally change a nested property like `customer.email`,
// it will silently overwrite the original customer data causing future receipts or notifications to be sent to the wrong email address
//
// 3. Rest and spread both use "...". In one sentence each, what does each do?
// Answer: Spread unpacks an array or object into individual elements
// Rest packs multiple individual elements or arguments into a single array
