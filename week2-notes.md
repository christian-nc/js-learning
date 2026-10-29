# Week 2 study notes: functions, arrays, objects, and state

Week 2, 19–27 October 2026. Files: `exercises05.js` to `exercises08.js`, `library.js`, `inventory.js`.

All code below is copied from your files. The comments explain how it works and why it matters for payments.

**Week 2 in one sentence:** a function takes input, checks it, and returns a result. When it changes something, it checks everything first and changes after, so a failure leaves nothing half-done.

---

## Contents

1. [Functions and return values (Day 1)](#1-functions-and-return-values-day-1)
2. [Scope, hoisting, arrow functions, closures (Day 2)](#2-scope-hoisting-arrow-functions-closures-day-2)
3. [Arrays, references, map and filter (Day 3)](#3-arrays-references-map-and-filter-day-3)
4. [reduce and objects (Day 4)](#4-reduce-and-objects-day-4)
5. [Contracts and a function library (Day 5)](#5-contracts-and-a-function-library-day-5)
6. [State that changes: the inventory tracker (Day 6)](#6-state-that-changes-the-inventory-tracker-day-6)
7. [Errors: throw, try/catch, and checkThrows](#7-errors-throw-trycatch-and-checkthrows)
8. [Map and destructuring (the two fuzzy ones)](#8-map-and-destructuring-the-two-fuzzy-ones)
9. [Payment rules from this week (cheat sheet)](#9-payment-rules-from-this-week-cheat-sheet)
10. [Still to practise](#10-still-to-practise)

---

## 1. Functions and return values (Day 1)

### `return` vs no `return`

```js
function noReturn(a, b) {
  const total = a + b; // calculated, then thrown away
}
function withReturn(a, b) {
  return a + b;
}

noReturn(2, 3); // undefined: no return means undefined
withReturn(2); // NaN: b is undefined, and 2 + undefined is NaN
withReturn("2", 3); // "23": + with a string joins text, it doesn't add
```

**Payment angle:** `NaN` and `"23"` don't throw. They flow silently into totals, receipts and databases. That's why every money function below checks its input first.

**Why return instead of `console.log`:** a returned value can be tested with `check()`, saved, put in a receipt or an email, or passed to another function. Printed text can only be read by a person.

### `isValidAmount`: the one rule for money

```js
const MAX_KOBO = 99900000000000; // ₦999,000,000,000: our business limit

const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false; // rejects "500", new Number(5)
  return (
    Number.isSafeInteger(kobo) && // rejects 3.5, NaN, Infinity, huge numbers
    kobo >= 1 && // rejects 0 and negatives
    kobo <= MAX_KOBO
  ); // rejects amounts above our limit
};
```

- Money is stored as **whole kobo** (integers), never naira with decimals, because `0.1 + 0.2 !== 0.3`.
- `Number.isSafeInteger` doesn't know your business limit. That's why `MAX_KOBO` is there as well.
- **One rule in one place:** every other function calls `isValidAmount` instead of repeating these checks.

### Default parameters, rounding, and validating the rate

```js
const isValidRate = (ratePercent) =>
  Number.isFinite(ratePercent) && ratePercent >= 0 && ratePercent <= 100;

const isValidAmountOrZero = (kobo) => kobo === 0 || isValidAmount(kobo);

const calculateTax = (kobo, ratePercent = 7.5) => {
  // 7.5 is used if no rate is given
  if (!isValidRate(ratePercent)) throw new Error("Invalid tax rate");
  if (!isValidAmountOrZero(kobo)) {
    throw new Error(
      "Invalid kobo amount: must be a valid positive whole number or zero"
    );
  }
  return Math.round(kobo * (ratePercent / 100)); // whole kobo only
};

calculateTax(1999); // 149.925 rounds to 150
```

- `Math.round` because a fraction of a kobo can't be paid. Rounding up means the payer pays slightly more; rounding down means the merchant gets slightly less. **Write down which way you round and why.**
- `Number.isFinite` rejects `Infinity`. Checking only `rate >= 0` would let it through.
- Zero is allowed here (tax on ₦0 is ₦0) but **not** in `isValidAmount`. That's why the "or zero" rule has its own helper instead of loosening the main rule.

### `formatNaira`: for display only

```js
const formatNaira = (kobo) => {
  if (!isValidAmount(kobo))
    throw new Error("Invalid kobo amount for formatting");
  const naira = kobo / 100;
  return "₦" + naira.toFixed(2); // 1999 → "₦19.99"
};
```

The result is a **string for screens and receipts**. Never do maths on it. Calculate in kobo and format at the very end.

### `parseGuess`: check the text before turning it into a number

```js
function parseGuess(rawText) {
  if (typeof rawText !== "string") return null;
  const text = rawText.trim(); // " 42 " → "42" (friendlier for users)
  if (!/^\d+$/.test(text)) return null; // digits only: rejects "", "1e1", "0x1F", "+5", "3.5"
  const guess = Number(text);
  if (Number.isInteger(guess) && guess >= 1 && guess <= 100) return guess;
  return null;
}
```

Why check the text first: `Number("")` is `0`, `Number("1e1")` is `10`, and `Number("0x1F")` is `31`. `Number()` accepts formats you don't want. **Order matters:** trim first, then the pattern check, then `Number()`.

---

## 2. Scope, hoisting, arrow functions, closures (Day 2)

### Scope

```js
const rate = 7.5;
function showRate() {
  const rate = 10; // a new variable that "shadows" the outer one inside this function
  return rate; // 10
}
rate; // still 7.5

if (true) {
  let insideBlock = "hello"; // let/const: only exists inside { }
  var leaky = "world"; // var: ignores the { } of an if, leaks out
}
typeof insideBlock; // "undefined"
typeof leaky; // "string"
```

Use `let` and `const`, not `var`. A variable that leaks out of its block can be changed by code that shouldn't be able to see it.

### `const` stops reassignment, not changes

```js
const prices = [100, 200];
prices.push(300); // allowed: the same array, its contents changed
prices = [1]; // TypeError: you can't point a const at a different array
```

### Three ways to write a function, and hoisting

```js
doubleA(10); // works: declarations are hoisted (ready before their line)
function doubleA(n) {
  return n * 2;
}

const doubleB = function (n) {
  return n * 2;
}; // expression
const doubleC = (n) => n * 2; // arrow: one line, no return or { } needed
```

Calling `doubleB` or `doubleC` before their line gives:
`ReferenceError: Cannot access 'doubleC' before initialization`.
The `const` exists but can't be used until its line runs. This is the same error that made your Day 5 `bigList` test pass for the wrong reason.

**Arrow rule:** a one-line body can skip `return` and `{ }`. If you need `if` or `throw`, use `{ }` and write `return`.

### Closures: a function that remembers

```js
function makeCounter() {
  let count = 0; // private: nothing outside can reach it
  return function () {
    count++;
    return count;
  };
}
const counterA = makeCounter();
const counterB = makeCounter();
counterA();
counterA(); // 1, 2
counterB(); // 1: each makeCounter() call creates its own count
```

```js
function makeTaxCalculator(ratePercent) {
  if (!Number.isFinite(ratePercent) || ratePercent < 0 || ratePercent > 100) {
    throw new Error("Invalid tax rate"); // fail EARLY, when the calculator is created
  }
  return (kobo) => calculateTax(kobo, ratePercent); // ratePercent is remembered
}
const vat = makeTaxCalculator(7.5);
vat(10000); // 750
```

Why validate early: a bad rate is caught once, at setup, with a clear error. Otherwise the problem would only appear later, in the middle of charging customers.

### The shared-state bug and its fix

The original code had one global `total` shared by every customer, so customer B's total started where customer A's ended. The fix gives each customer their own closure:

```js
function makeTotal() {
  let total = 0; // one private total per customer
  return function addToTotal(amountKobo) {
    total = total + amountKobo;
    return total;
  };
}
const customerA = makeTotal();
const customerB = makeTotal();
customerA(1000); // 1000
customerB(500); // 500, not 1500
```

**Payment angle:** shared money state is how one customer's balance leaks into another's. In Phase 3 the same idea appears again as race conditions.

---

## 3. Arrays, references, map and filter (Day 3)

### A closure remembers the variable, not the value

```js
let fee = 100;
function makeFeeAdder() {
  return (kobo) => kobo + fee; // reads `fee` each time it runs
}
const addFee = makeFeeAdder();
fee = 200;
addFee(1000); // 1200, not 1100

function makeFixedFeeAdder(fixedFee) {
  return (kobo) => kobo + fixedFee; // its own parameter, which no one else can change
}
const addFixedFee = makeFixedFeeAdder(100);
fee = 300;
addFixedFee(1000); // 1100
```

For payments, trust the second one: the fee can't change after the calculator is created.

### Arrays are shared by reference

```js
const cart = [];
cart.push(500); // returns 1 (the new LENGTH), not the array
[1, 2] === [1, 2]; // false: two different arrays that look the same
const sameList = cart; // NOT a copy, just a second name for the same array
sameList.push(999);
cart; // [500, 999]
pricesKobo[4]; // undefined: no error when you read past the end
```

### `map` transforms every item, `filter` keeps some

```js
const withVatMap = (prices) =>
  prices.map((price) => price + calculateTax(price));

const getSucceeded = (list) => list.filter((t) => t.status === "succeeded");

// Chain: filter first (objects still have .status), then map
const succeededIds = transactions
  .filter((t) => t.status === "succeeded")
  .map((t) => t.id); // ["T1", "T3", "T5"]
```

- Both return a **new array** and leave the original alone.
- **Order matters:** with map-then-filter, the items are already strings like `"T1"`, so `.status` is `undefined` and you silently get `[]`.
- `"succeeded"` and `"Succeeded"` are different strings. That's why Day 4 adds `normalizeStatus`.

### Bug: changing the original array

The original `applyDiscount` changed `refundsKobo` itself, which is the record of what customers are owed. The fix uses `map`, so the original stays untouched:

```js
function applyDiscount(prices) {
  return prices.map((price) => price - 100);
}
```

### Don't lose bad records: split them and count

```js
const getValidAmounts = (list) =>
  list.filter((amount) => isValidAmount(amount));
const getInvalidAmounts = (list) =>
  list.filter((amount) => !isValidAmount(amount));

check(
  "all records accounted for",
  valid.length + invalid.length,
  rawAmounts.length
);
```

The count check catches records that vanish or get counted twice because of a bug in either filter. Every record is either valid or invalid, so the two counts must add up to the total.

---

## 4. reduce and objects (Day 4)

### `reduce` combines a list into one value

```js
const sumReduce = (list) => {
  return list.reduce((total, amount) => {
    if (!isValidAmount(amount)) {
      throw new Error(`Invalid amount detected: ${amount}`);
    }
    const newTotal = total + amount;
    if (!Number.isSafeInteger(newTotal)) {
      // added on Day 5
      throw new Error(
        `Running total exceeded safe integer limits: ${newTotal}`
      );
    }
    return newTotal; // FORGET this and the next round gets undefined, giving NaN
  }, 0); // the initial value
};
```

**Why the `0` matters (quiz Q4):** without an initial value, `reduce` uses the **first item** as its starting value. An empty array has no first item, so it throws `TypeError: Reduce of empty array with no initial value`. With `0`, an empty day correctly totals `0`. A day with no payments is normal, not an error.

### Objects: dot vs brackets

```js
payment.amountKobo; // reads the key literally called "amountKobo"
payment[field]; // reads the key whose NAME is stored in the variable field
payment.missing; // undefined: no error, which is another silent value
```

### One status rule, used everywhere

```js
const KNOWN_STATUSES = new Set(["succeeded", "failed", "pending"]);

const normalizeStatus = (status) => {
  if (typeof status !== "string")
    throw new Error(`Invalid transaction status: ${status}`);
  const normalized = status.trim().toLowerCase(); // " SUCCEEDED " → "succeeded"
  if (!KNOWN_STATUSES.has(normalized)) {
    // unknown? reject, don't guess
    throw new Error(`Unknown transaction status: ${status}`);
  }
  return normalized;
};
```

(`Set` is a list where each value appears once. `.has(x)` asks "is x in it?" and returns `true` or `false`.)

**The Day 4 bug you found:** `totalSucceeded` and `countByStatus` used **different** status rules, so the day's summary disagreed with itself. The fix was one rule (`normalizeStatus`) that both functions call.

### `reduce` into an object (counting)

```js
const countByStatus = (list) => {
  return list.reduce((acc, t) => {
    const status = normalizeStatus(t?.status); // t?.status: undefined if t is missing, no crash
    if (acc[status] === undefined) acc[status] = 0;
    acc[status] = acc[status] + 1;
    return acc;
  }, {}); // start from an empty object
};
// → { succeeded: 4, failed: 1, pending: 1 }
```

### filter, then map, then reduce

```js
const totalSucceeded = (list) =>
  sumReduce(
    list
      .filter((t) => normalizeStatus(t?.status) === "succeeded")
      .map((t) => t.amountKobo)
  );
```

### All-or-nothing (first version)

```js
function applyDiscountStrict(prices) {
  return prices.map((price) => {
    if (price < 100 || !isValidAmount(price)) {
      throw new Error(
        `Invalid price: ${price}. Prices below 100 do not qualify for a discount.`
      );
    }
    return price - 100;
  });
}
```

One bad price rejects the whole batch. That's better than applying half the discounts and not knowing which ones went through. `map` builds a new array, so if it throws partway, the original is untouched.

### CSV trap

CSV values arrive as **strings**. `"1000,500".split(",").map(Number)` converts them, but `Number("")` is `0`, so conversion doesn't make a value valid. Always validate after converting.

---

## 5. Contracts and a function library (Day 5)

### The contract template

```
name(input)
  Input:       what it accepts (types, units, limits)
  Output:      what it returns (type, units, whole number or not?)
  Empty input: what happens with [] or ""
  Bad input:   throw, or return the bad items? Which, and why?
```

Write it **before** the code. The tests then check the contract. If the code and the contract disagree, one of them is a bug.

### Built-in traps

```js
Math.max(); // -Infinity: an empty "largest payment" report shows -Infinity
Math.max(3, "10"); // 10: the string gets converted silently
Number.MAX_SAFE_INTEGER; // 9007199254740991
9007199254740991 + 2; // 9007199254740992: WRONG, and no error
```

Above the safe limit, JavaScript rounds silently. For money, a silent wrong number is worse than a crash.

### The library functions

```js
const average = (list) => {
  if (list.length === 0)
    throw new Error("Cannot calculate average of an empty list"); // 0/0 is NaN
  return Math.round(sumReduce(list) / list.length); // reuse sumReduce, round to whole kobo
};

const max = (list) => {
  if (list.length === 0)
    throw new Error("Cannot calculate max of an empty list");
  if (!isValidAmount(list[0])) throw new Error("Invalid amount in list"); // first item is the start value
  return list.reduce((max, current) => {
    if (!isValidAmount(current))
      throw new Error("Cannot calculate max on an invalid list");
    return current > max ? current : max;
  }); // no initial value, so check list[0] separately
};

const largestTransaction = (list) => {
  const successful = list.filter(
    (t) => normalizeStatus(t.status) === "succeeded"
  ); // received money only
  if (successful.length === 0) throw new Error("No successful transactions");
  const maxAmount = max(successful.map((t) => t.amountKobo));
  return successful.find((t) => t.amountKobo === maxAmount); // find returns the FIRST match: tie → first
};

const wordCount = (text) => {
  if (typeof text !== "string") throw new Error("Input must be a string");
  const words = text
    .toLowerCase()
    .split(" ")
    .filter((word) => word !== ""); // drop empty pieces from extra spaces
  return words.reduce((counts, word) => {
    counts[word] = (counts[word] || 0) + 1; // first time: undefined || 0 → 0, then +1
    return counts;
  }, {});
};
```

**Empty input differs by function, on purpose:** `average([])` and `max([])` throw because there's no meaningful answer. `wordCount("")` returns `{}` because "no words" is a correct answer.

### Objects as lists

```js
Object.keys({ succeeded: 4, failed: 1 }); // ["succeeded", "failed"]
Object.values({ succeeded: 4, failed: 1 }); // [4, 1]
Object.entries({ succeeded: 4, failed: 1 }); // [["succeeded", 4], ["failed", 1]]
```

They turn an object into an array, so `map`, `filter` and `reduce` work on it.

### An independent self-check

```js
const countsMatchTotal = (summary) =>
  Object.values(summary.byStatus).reduce((a, b) => a + b, 0) === summary.count;
```

It doesn't repeat `summarizeDay`'s logic. It checks a separate fact: the status counts must add up to the total. A check that repeats the same logic also repeats the same bug, so it can't catch it.

---

## 6. State that changes: the inventory tracker (Day 6)

Swap "stock" for "balance" and "product" for "account": every bug here is a payment bug.

### Changing an object vs pointing a variable elsewhere

```js
const inv1 = makeInventory();
const oil = inv1[1]; // points at the same object, no copy
oil.stock = oil.stock - 1; // CHANGES the object, so inv1[1].stock is now 2 too

let rice = inv1[0];
rice = { sku: "RICE-5KG", stock: 99 }; // only moves the VARIABLE; inv1[0] is untouched
```

**How to tell by looking:** `something.key = ...` or `.push(...)` changes the object. `name = ...` only moves the name.

### `findProduct`: never return `undefined` silently

```js
const findProduct = (inventory, sku) => {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    throw new Error("Array must not be empty");
  }
  if (typeof sku !== "string" || sku.trim() === "") {
    throw new Error("SKU must be a non-empty string");
  }
  const product = inventory.find((p) => p.sku === sku); // case-sensitive on purpose
  if (!product) throw new Error(`Product not found: ${sku}`);
  return product; // the real object, not a copy, so callers can change it
};
```

`find` returns `undefined` when nothing matches. `product.stock - 1` would then crash, which is at least loud. `product?.stock - 1` gives `NaN`, which is **silent**. Throwing with a clear message is better than both.

### Check first, then change

```js
const removeStock = (inventory, sku, qty) => {
  const product = findProduct(inventory, sku);
  if (!Number.isSafeInteger(qty) || qty <= 0) {
    // rejects 0, -3, 1.5, "5"
    throw new Error("Quantity must be a positive whole number");
  }
  if (qty > product.stock) throw new Error("Insufficient stock"); // CHECK...
  product.stock -= qty; // ...THEN change
  return product.stock;
};
```

Compare this with the quiz Q5 `withdraw`, which changes first and checks after. When that throws, the money is already gone and the account is negative. **A function that throws after changing state is worse than one that never throws.**

Why reject negatives: `removeStock(inv, "OIL-1L", -3)` would _add_ 3. In payments, "withdraw −₦3,000" deposits money.

**Test the state after a failure, not only that it threw:**

```js
checkThrows("remove too many milk", () => removeStock(inv3, "MILK-400G", 8));
check(
  "milk unchanged after failed remove",
  findProduct(inv3, "MILK-400G").stock,
  7
);
```

### When a library rule doesn't fit: `stockValue`

Sugar has `stock: 0`, so its value is `0`. `sumReduce` rejects `0` because it uses `isValidAmount`, and a **payment** of ₦0 is invalid. But a **shelf** with ₦0 of sugar is normal. Your decision: keep the payment rule strict and write a separate rule for inventory.

```js
const stockValue = (inventory) => {
  if (!Array.isArray(inventory)) throw new Error("Inventory must be an array");
  const productValues = inventory.map((product) => {
    const { priceKobo, stock } = product; // destructuring, see section 8
    if (!isValidAmount(priceKobo)) throw new Error("Invalid price of product");
    if (!Number.isSafeInteger(stock) || stock < 0)
      throw new Error("Invalid stock quantity"); // 0 allowed
    const value = priceKobo * stock;
    if (!Number.isSafeInteger(value))
      throw new Error("Product value exceeds safe integer limits");
    return value;
  });
  return productValues.reduce((total, value) => {
    const newTotal = total + value;
    if (!Number.isSafeInteger(newTotal))
      throw new Error("Inventory total exceeds safe integer limits");
    return newTotal;
  }, 0);
};
```

**Rule:** don't loosen a payment rule for "just this one case". Write a new rule with its own name and a comment saying why.

### A batch that is all-or-nothing: `applyMovements`

The obvious loop (6a) calls `addStock`/`removeStock` one by one. When movement 3 fails, movements 1 and 2 have **already happened**: rice went from 12 to 22 even though the batch "failed". In a bank batch, the customer sees "failed", but two transfers already left. If they press retry, those two run again.

The fix uses two passes:

```js
const applyMovements = (inventory, movements) => {
  if (!Array.isArray(inventory)) throw new Error("Inventory must be an array");
  if (!Array.isArray(movements)) throw new Error("Movements must be an array");

  const changes = new Map(); // sku → stock as it WOULD be (see section 8)

  // Pass 1: check and simulate. Nothing real is changed here.
  for (const movement of movements) {
    if (movement.type !== "in" && movement.type !== "out") {
      throw new Error(`Unknown movement type: ${movement.type}`);
    }
    if (!Number.isSafeInteger(movement.qty) || movement.qty <= 0) {
      throw new Error("Quantity must be a positive integer");
    }
    const product = findProduct(inventory, movement.sku);

    // Second movement for the same sku? Start from the SIMULATED value, not the real stock.
    const currentSimulated = changes.has(movement.sku)
      ? changes.get(movement.sku)
      : product.stock;

    let newSimulated;
    if (movement.type === "in") newSimulated = currentSimulated + movement.qty;
    else newSimulated = currentSimulated - movement.qty;

    if (newSimulated < 0)
      throw new Error(`Insufficient stock for ${movement.sku}`);
    if (!Number.isSafeInteger(newSimulated))
      throw new Error("Stock exceeds safe integer limits");

    changes.set(movement.sku, newSimulated);
  }

  // Pass 2: apply. Only reached if every movement passed.
  for (const [sku, finalStock] of changes.entries()) {
    const product = findProduct(inventory, sku);
    product.stock = finalStock;
  }
};
```

**The hard case:** OIL has 3, and a batch removes 2, then 2 again. Check each removal against the _real_ stock and both pass (2 ≤ 3, then 2 ≤ 3 again), so you'd sell 4 from 3. Check against the _simulated_ stock and the second removal sees only 1 left, so it's rejected. The Map is what carries "1 left" forward to the next movement.

### Reconciliation: an independent check

```js
const countStock = (inv) => inv.reduce((sum, p) => sum + p.stock, 0);

const invCheck = makeInventory();
const totalBefore = countStock(invCheck); // 22 (a number, saved now)

const totalIn = movements
  .filter((movement) => movement.type === "in")
  .reduce((sum, movement) => sum + movement.qty, 0); // 10
const totalOut = movements
  .filter((movement) => movement.type === "out")
  .reduce((sum, movement) => sum + movement.qty, 0); // 5

applyMovements(invCheck, movements);
const totalAfter = countStock(invCheck); // 27

check("total stock math", totalBefore + totalIn - totalOut, totalAfter);
```

This is **reconciliation**: opening balance + credits − debits = closing balance. It doesn't use the Map or the movement logic, so a bug in `applyMovements` can't hide here. `totalBefore` stays 22 after the batch runs because it's a number saved before the change, not a reference to the inventory.

### What the two-pass method can't fix (Phase 3)

Two requests run at the same time. Both read "5 oil left", both remove 4, and both write 1. You sold 8 from 5. In payments that's a **double-spend**. Checking in code isn't enough when two requests overlap; database locks fix this in Phase 3.

---

## 7. Errors: throw, try/catch, and checkThrows

### `throw`: stop right here

```js
throw new Error("Insufficient stock");
```

- `new Error("...")` creates an error object. The text becomes `error.message`.
- `throw` stops the function **immediately**. No more lines in it run, and it returns nothing.
- The error travels up to whoever called the function, then their caller, and so on, until something catches it. If nothing catches it, Node prints the error and a stack trace and the program stops.

**Write messages that say what went wrong and with what value:**

```js
throw new Error(`Invalid amount detected: ${amount}`); // good: shows the bad value
throw new Error("Error"); // useless when you're debugging later
```

### `try/catch`: handle it here

```js
try {
  for (const m of badMovements) {
    if (m.type === "in") addStock(inv, m.sku, m.qty);
    else if (m.type === "out") removeStock(inv, m.sku, m.qty);
  }
} catch (error) {
  console.log("Batch failed:", error.message); // runs only if something in try threw
}
// the program carries on from here
```

- Code in `try` runs normally. At the first `throw`, it jumps straight to `catch`, and the rest of `try` is skipped.
- `error` is the object that was thrown, so `error.message` is your text.
- **Catching an error doesn't undo anything.** In the loop above, rice was already +10 before the error. That's why `applyMovements` checks everything before it changes anything.

### How `checkThrows` works

```js
function checkThrows(testName, fn) {
  // fn is a FUNCTION to run later, not a result
  try {
    fn(); // run the code we expect to fail
    console.log(`FAIL - ${testName} (expected to throw, but it did not)`);
    return false; // reached only if fn() did NOT throw
  } catch (error) {
    console.log(`PASS - ${testName} (threw: "${error.message}")`);
    return true; // ANY error lands here
  }
}

checkThrows("unknown sku", () => findProduct(inv2, "BEANS-1KG"));
```

**Why the `() =>`:** if you wrote `checkThrows("x", findProduct(inv2, "BEANS-1KG"))`, `findProduct` would run **before** `checkThrows` starts, outside its `try`, and the whole file would crash. The arrow wraps the call so `checkThrows` can run it inside its own `try`.

**Its weakness: any error counts as a pass.** Two of your tests passed for the wrong reason:

| Test                                         | What it printed                                 | Real cause                   |
| -------------------------------------------- | ----------------------------------------------- | ---------------------------- |
| Arguments swapped: `checkThrows(fn, "name")` | `fn is not a function`                          | The test never ran your code |
| `bigList` test placed above `const bigList`  | `Cannot access 'bigList' before initialization` | The list didn't exist yet    |

**Rule:** after every `checkThrows`, read the message. It must be **your** error message. A `TypeError` or `ReferenceError` you didn't write means the test is broken.

**Second rule:** after a `checkThrows` on something that changes state, add a `check` that the state didn't change.

---

## 8. Map and destructuring (the two fuzzy ones)

### Destructuring: take keys out of an object

```js
const product = { sku: "OIL-1L", priceKobo: 240000, stock: 3 };

const { priceKobo, stock } = product;
// exactly the same as:
const priceKobo = product.priceKobo;
const stock = product.stock;
```

- The names in `{ }` must match the keys. A key that doesn't exist gives `undefined`, with no error.
- It only **copies the values out**. `stock = 10` afterwards does **not** change `product.stock`.

Destructuring also works on arrays, by position. That's what `for (const [sku, finalStock] of changes.entries())` does: each entry is a pair `["OIL-1L", 1]`, so `sku` gets the first item and `finalStock` the second.

Full lesson: Week 3.

### `Map`: a lookup table

```js
const changes = new Map(); // empty table

changes.set("OIL-1L", 1); // store 1 under the key "OIL-1L"
changes.get("OIL-1L"); // 1
changes.get("RICE-5KG"); // undefined: nothing stored under that key
changes.has("OIL-1L"); // true
changes.has("RICE-5KG"); // false
changes.set("OIL-1L", 0); // same key again: REPLACES the value
changes.entries(); // all pairs: ["OIL-1L", 0], ...
```

**Trace of `applyMovements` on `badMovements`, so you can see the Map at each step:**

| Movement   | `has`?  | Start from      | New value | Map after                              |
| ---------- | ------- | --------------- | --------- | -------------------------------------- |
| RICE in 10 | no      | real stock 12   | 22        | RICE→22                                |
| OIL out 2  | no      | real stock 3    | 1         | RICE→22, OIL→1                         |
| OIL out 5  | **yes** | **simulated 1** | −4        | throws "Insufficient stock for OIL-1L" |

Nothing reached pass 2, so the real inventory is unchanged.

**Map vs a plain object `{}`:** you could do the same with `changes[sku] = value`. A Map is built for lookup tables: `has/get/set` read clearly, and it has no built-in keys that could clash with yours.

---

## 9. Payment rules from this week (cheat sheet)

1. **Money is whole kobo.** Integers only, checked with `isValidAmount`. Format to naira only for display.
2. **One rule in one place.** `isValidAmount`, `isValidRate`, `normalizeStatus`. Two copies of a rule eventually disagree (the Day 4 summary bug).
3. **Don't loosen a payment rule for a new case.** Write a new rule with its own name (`isValidAmountOrZero`, the stock check in `stockValue`).
4. **Throw instead of returning something wrong.** `NaN`, `-Infinity`, `undefined`, `"23"` and rounded big numbers are all silent.
5. **Check first, then change.** If a function throws, nothing should have changed.
6. **Batches are all-or-nothing.** Pass 1 checks and simulates; pass 2 applies.
7. **Test the state after a failure,** not only that it threw.
8. **Read every `checkThrows` message.** It must be your error.
9. **Check results with an independent fact** (record counts add up; before + in − out = after), not by repeating the same logic.
10. **Reject negatives and zero quantities.** "Withdraw −3000" is a deposit.
11. **Watch running totals.** Valid amounts can add up past `MAX_SAFE_INTEGER`.
12. **Shared state is dangerous.** Closures keep state private; Phase 3 adds locks for two requests at once.

---

## 10. Still to practise

From your log and this week's review:

- **Name the bug before fixing it:** say what the customer sees (quiz Q5).
- **Why `reduce` with no initial value throws on `[]`** (quiz Q4).
- `Map` (`has/get/set`) and destructuring: trace them on paper with the table in section 8.
- Tracing an object after it changes.
- Keeping the contract and the code in agreement (`lowStock` promised to check stock values but doesn't).
- No silent skips: an `if / else if` with no `else` ignores anything that matches neither branch (6a loop).
- Time-boxing: after 20 minutes stuck, ask for a hint.
- Punctuation in `wordCount` (a regular expression, later).
