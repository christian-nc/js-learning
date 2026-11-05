# Week 3, Day 3 - `try/catch/finally` and custom errors

**Theme:** what to do when something goes wrong. For two weeks you've been throwing errors (`throw new Error("...")`) and only catching them inside `checkThrows`. Today you catch them in your own code and decide what each error means.

The payment angle:

1. **"The input was bad" and "my code broke" are different problems.** A bad amount from a merchant gets a 400 and a message saying which field is wrong. A `TypeError` in your own code gets a 500 and an alert to you. If you mix them up, your bugs look like customers sending bad data, and nobody fixes them.
2. **A `catch` that hides an error is worse than a crash.** `catch (error) { console.log(error) }` followed by "carry on" is how a payment ends up marked as succeeded when the charge never happened.
3. **Cleanup has to happen even when things fail.** If you lock an account while you spend from it and an error skips the unlock, that account stays frozen. `finally` is the fix.

**By the end of today I can:**

- Predict the order in which `try`, `catch`, `finally` and the code after them run, including when `try` contains a `return`
- Say what's inside a caught error (`name`, `message`, `stack`) and read a stack trace to find the line that failed
- Explain why you should always throw `Error` objects, never strings
- Write a custom error class (`ValidationError`) with an extra field, and check for it with `instanceof`
- Wrap a low-level error in a clearer one without losing the original (`cause`)
- Catch only the errors I can handle and let the rest escape
- Use `finally` to release something no matter how the function ends
- Map an error to an HTTP status: 400, 502 or 500

---

## 1. Learn (60 min)

| Minutes | Topic                                                                        | Read for                                                                                                      |
| ------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 20      | javascript.info: "Error handling, try...catch"                               | the error object, **rethrowing** ("catch should only process errors that it knows and rethrow all others"), `finally` |
| 15      | javascript.info: "Custom errors, extending Error"                            | `class ValidationError extends Error`, why you set `this.name`, `instanceof`, "wrapping exceptions"             |
| 10      | MDN: "try...catch" (the `finally` section and its examples)                  | `finally` runs even after a `return` in `try`                                                                 |
| 10      | MDN: "Error", then "Error: cause"                                            | `name`, `message`, `stack`, and how `{ cause }` keeps the original error                                      |
| 5       | MDN: "HTTP response status codes", read only 400, 500 and 502                | which side is at fault for each                                                                               |

The three parts:

| Block     | Runs when                                             | Typical use                                |
| --------- | ----------------------------------------------------- | ------------------------------------------ |
| `try`     | always, until the first error                         | the work that might fail                   |
| `catch`   | only if something in `try` threw                      | handle the errors you understand, rethrow the rest |
| `finally` | always, after `try` (and `catch`), even after `return` | cleanup: release a lock, close a file      |

You can have `try/catch`, `try/finally`, or all three. A `try` alone is a syntax error.

New syntax you'll meet today: `class`. You'll study classes properly later. Today you only need the pattern in Exercise 4.

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Everything happens in `exercises13.js` (already written up to the parts you fill in), plus one new module, `lib/errors.js`, and a fix to `lib/testing.js`.

| #   | Exercise                                                          | Rough time |
| --- | ----------------------------------------------------------------- | ---------- |
| 0   | Lint clean-up: quiet the old files, add `no-throw-literal`        | 5          |
| 1   | Predict the flow (predictions only, plus one lint fix)            | 10         |
| 2   | `catchError` and the error object                                 | 10         |
| 3   | `checkThrows` survives non-Error throws                           | 5          |
| 4   | `lib/errors.js`: `ValidationError`, `ProviderError`, `toHttpStatus` | 15         |
| 5   | `validatePayment` (**hardest**)                                   | 20         |
| 6   | `processBatch`: catch only what you can handle                    | 10         |
| 7   | `withLock`: `finally` for cleanup                                 | 10         |
| 8   | Think (comments only)                                             | 5          |

Rules for today (same as before):

- **Contract first** for every function you write (input, output, empty, bad input).
- **Predict first, then run.** Write the prediction in a comment before you run.
- **A passing `checkThrows` must pass for the right reason.** Your helper now checks that.
- **Don't edit an expected value** to make a test pass unless you've worked it out by hand. Every expected value in `exercises13.js` has been checked.
- **Time-box rule:** stuck for 20 minutes? Ask for a hint. Exercise 5 is the most likely.
- **Run `npm run lint`** before you commit.

Run the file after each exercise: `node exercises13.js`. Sections you haven't reached yet crash with `Error: TODO: write <name>` or `ValidationError is not defined`. That's expected. Read which name it complains about.

---

### Exercise 0: Lint clean-up (5 min)

Right now `npm run lint` reports 32 errors, all in files written before you set up ESLint (`day01.js`, `exercises01.js` to `exercises08.js`, `inventory.js`). With that much noise you'll stop reading the output, and then a real problem in today's file gets missed.

1. In `eslint.config.mjs`, add a new object to the array that contains **only** an `ignores` key:

   ```js
   { ignores: ["day01.js", "exercises0*.js", "inventory.js"] },
   ```

   An object with nothing but `ignores` applies to the whole config. `exercises0*.js` matches `exercises01.js` to `exercises08.js`. Those files stay in Git as your history; they just aren't linted any more.

2. Add `"no-throw-literal": "error"` to the `rules` in **both** blocks (`.js` and `.mjs`). This rule stops you writing `throw "some text"`. Exercise 2 shows why that matters.
3. Run `npm run lint`. Expected: the only file listed is `exercises13.js`, with errors such as `'ValidationError' is not defined` and warnings such as `'fn' is defined but never used`. Those come from the parts you haven't written yet and go away as you work.

---

### Exercise 1: Predict the flow (10 min)

Section 1 has four small functions that use `try/catch/finally`. They're already written. For each one, write your predicted array in the comment **before** running. Then run and compare.

- 1a and 1b: the basic order, with and without a throw.
- 1c: `return` inside `try`, with a `finally` that changes the array. This one surprises most people. Two things combine here: `finally` runs after `return` (MDN), and the array is returned by reference (Week 2).
- 1d: a `catch` that throws again. Which `finally` runs, and which `catch` sees the second error?

Then run `npm run lint`. ESLint reports `preserve-caught-error` on the `throw new Error("second")` line inside `throwInCatch`. Read the message: you threw a new error from inside a `catch` and the original was lost. Fix it by passing the original as the cause:

```js
throw new Error("second", { cause: error });
```

Run the file again. 1d must still pass, because `cause` doesn't change the message. Remember this rule; it will warn you again in Exercise 5 if you forget `cause`.

---

### Exercise 2: `catchError` and the error object (10 min)

Write `catchError(fn)`, a small tool you'll use for the rest of today's tests.

- It calls `fn()` with no arguments.
- If `fn` throws **anything**, return exactly what was thrown. Don't wrap it or copy it. (Test 2e checks it's the same error.)
- If `fn` doesn't throw, return `{ name: "NoError", message: "nothing was thrown" }`.

Why not return `null` when nothing is thrown? Later tests read `.name` and `.field` from the result. `null.field` would crash the whole file at the first missing throw. With the fallback object you get one clear FAIL line and the rest of the tests still run. A test helper must never be the thing that crashes.

Then:

- **2f:** uncomment the `console.log(... .stack)` line, run, and answer in the comments: which line of `exercises13.js` does the stack point to, and what's the first line (the header)? Comment it out again. Being able to go from a stack trace to the exact line is most of debugging.
- **2g:** the tests show that a thrown string comes back as just a string, with no `.name` and no `.stack`. Answer the question in the comment. (You turned on `no-throw-literal` in Exercise 0, which is why this test file needs `eslint-disable-next-line` comments to throw a string on purpose.)

Expected: 2a `TypeError`, 2b `SyntaxError`, 2c `RangeError`, 2d `NoError`, 2e `true`, 2g both pass.

---

### Exercise 3: `checkThrows` survives non-Error throws (5 min)

Your own contract comment on `checkThrows` in `lib/testing.js` says it crashes if `fn` throws a string, because `error.message` is `undefined` and `undefined.includes(...)` is a `TypeError`. Fix it in `lib/testing.js`:

- At the start of the `catch` block, work out the message **once**: if the thrown value is an `Error` (`instanceof Error`), use its `.message`; otherwise use `String(thrownValue)`.
- Use that one message everywhere below it: in all the printed lines and in the `.includes()` check.
- Update the contract comment: remove the crash caveat, and say what happens with non-Error throws now.

Expected Section 3 output: 3a `PASS`; 3b one `FAIL` line printed **by the helper** (`threw for the wrong reason: "card declined"`), then a `PASS` saying it returned `false`; 3c a `PASS` line showing `threw: "undefined"`, then a `PASS`. Sections 1, 2 and `exercises12.js` must still pass too. Run `node exercises12.js` to check you didn't break the old tests.

---

### Exercise 4: `lib/errors.js` (15 min)

A custom error is an `Error` with a more precise name and extra information. This is the pattern, shown with a **different** error from the ones you'll write:

```js
class TimeoutError extends Error {
  constructor(message, seconds, options) {
    super(message, options); // let Error set message, stack and cause
    this.name = "TimeoutError"; // without this, name stays "Error"
    this.seconds = seconds; // extra info for whoever catches it
  }
}

const e = new TimeoutError("Provider did not answer", 30);
e instanceof TimeoutError; // true
e instanceof Error; // true: it's still an Error
```

What each part does:

- `class TimeoutError extends Error`: a new kind of error that has everything `Error` has, plus whatever you add.
- `constructor(...)` runs when someone writes `new TimeoutError(...)`.
- `super(message, options)` runs `Error`'s own setup. It must come **before** any use of `this`.
- `options` is how `{ cause: originalError }` gets through to `Error`.

Tasks:

1. Create `lib/errors.js` with two classes following that pattern:
   - `ValidationError(message, field, options)`: the caller sent bad input. Stores `field` (which input was wrong, e.g. `"amount"`).
   - `ProviderError(message, provider, options)`: a payment provider failed or didn't answer. Stores `provider` (e.g. `"paystack"`).
2. Export only those two. Write the `require` line in Section 4 of `exercises13.js`. Run. 4a to 4d should pass.
3. Write `toHttpStatus(error)` in `exercises13.js`:
   - a `ValidationError` → `400` (Bad Request: the caller must fix their request)
   - a `ProviderError` → `502` (Bad Gateway: something we depend on failed)
   - **anything else**, including non-Errors and `undefined` → `500` (our own fault)
4. Two quick experiments. **Predict first**, write the result in a comment under Section 4, then undo:
   - a) Delete the `this.name = ...` line from `ValidationError`. Which tests fail?
   - b) Move `super(message, options)` below `this.field = field`. What's the first line of the error?

---

### Exercise 5: `validatePayment` (20 min, hardest)

`validatePayment(input)` checks a payment request and returns a clean copy, or throws a `ValidationError` that says which field is wrong. Apply the rules **in this order**, and stop at the first one that fails:

1. **Input:** must be an object. `null`, arrays, strings and numbers are not. Otherwise throw `ValidationError("Payment input must be an object", "input")`.
   Hint: `typeof null` is `"object"`, and so is `typeof []`. `Array.isArray` helps.
2. **Amount:** must pass `isValidAmount` (already required at the top of the file). Otherwise throw a `ValidationError` with field `"amount"` and a message that starts with `Invalid amount`, e.g. `` `Invalid amount: ${amount}` ``.
3. **Currency:** if it's **missing**, use `"NGN"`. If it's present, it must be exactly `"NGN"`. Otherwise throw field `"currency"`, message starting `Unsupported currency`. `null` is not missing, so `null` is rejected. (Week 3 Day 1: which kind of default ignores `null`?)
4. **Status:** call `normalizeStatus(status)` inside a `try`. If it throws, catch the error and throw a **new** `ValidationError` with field `"status"`, a message starting `Invalid status`, and `{ cause: error }` so the original isn't lost. Don't copy the list of statuses into this file: one rule, one place (yesterday's lesson).
5. **Return** a new object with exactly `amount`, `currency`, `status`, in that order. Never spread `input` into it. That's the mass-assignment bug from Day 1, and test 5a ("extra fields are dropped") checks for it.

Hint for step 4: a `const` declared inside `try { }` doesn't exist after the closing `}` (block scope, Week 2). Think about where to declare the variable that holds the normalized status.

Why throw instead of returning `false` like `isValidAmount` does? `isValidAmount` answers a yes/no question. `validatePayment` has to say **what** is wrong, so an API can tell the merchant "field `amount` is invalid" instead of just "bad request".

---

### Exercise 6: `processBatch` (10 min)

`processBatch(inputs, validate = validatePayment)` validates a list of payment requests. A bad request shouldn't stop the batch, but a bug should.

- If `inputs` is not an array, throw `ValidationError("Batch must be an array", "inputs")`.
- For each input, call `validate(input)`. Use the parameter, not `validatePayment` directly, so test 6d can pass in a broken validator.
  - It returns a result: push the result to `accepted`.
  - It throws a `ValidationError`: push `{ index, field, message }` to `rejected` and carry on with the next input. `index` is the input's position in the array.
  - It throws **anything else**: don't catch it. Rethrow it unchanged (`throw error;`), so it escapes `processBatch`.
- Return `{ accepted, rejected }`, in that order.

Expected: for the 5-item `batch` in Section 6, accepted amounts `[5000, 750]`, rejected indexes `[1, 2, 3]`, rejected fields `["amount", "status", "input"]`, and `accepted.length + rejected.length === 5`. Empty list gives `{ accepted: [], rejected: [] }`.

---

### Exercise 7: `withLock` (10 min)

The `lockedAccounts` Set and `isLocked` are already written in Section 7. Write `withLock(accountId, fn)`:

1. If `accountId` is already locked, throw `` new Error(`Account ${accountId} is already locked`) ``. **Where** you put this check matters; test 7c checks it.
2. Lock it: add `accountId` to `lockedAccounts`.
3. Call `fn()` and return its result.
4. However step 3 ends (a return or a throw), remove `accountId` from `lockedAccounts` afterwards. Use `finally`.
5. Don't catch errors from `fn`. They must come out of `withLock` unchanged (test 7b). That means `try/finally` with **no** `catch`.

If 7c fails, read its name carefully and trace by hand what your `finally` does when the **second** caller is refused. Whose lock does it remove?

---

### Exercise 8: Think (5 min, comments only, in Section 8)

1. Test 6d gives `processBatch` a broken validator. If `processBatch` caught **every** error and put it in `rejected`, what would the merchant see, and what would you (the developer) never find out?
2. `isValidAmount` returns `false`; `validatePayment` throws. When is returning `false` the better choice, and when is throwing better?
3. In code that charges a card, someone writes `catch (error) { console.log(error); }` and the function carries on to `order.status = "paid"`. What goes wrong?
4. In `withLock`, why must the "already locked" check come before the `try`, not inside it?
5. You call Paystack to charge ₦5,000 and it times out after 30 seconds. Did the charge fail? Which error would you throw, which status would your API return, and why shouldn't you tell the customer "payment failed"? (No single right answer yet. Idempotency in Phase 4 is the fix. Give your best thinking.)

---

## 3. Review (30 min)

1. Ask Claude: "Review `lib/errors.js`, `lib/testing.js` and `exercises13.js`".
2. Add a **Week 3, Day 3** entry to `LEARNING.md` with your 3 "still unsure" items and your answers to Exercise 4's two experiments.
3. Commit and push.

```bash
npm run lint
node exercises12.js
node exercises13.js
git status
git add .
git commit -m "feat: Week 3 Day 3 - try/catch/finally, custom errors"
git push
```

---

## Coming next: Day 4

Files and JSON. `fs.readFileSync` and `fs.writeFileSync`, `JSON.parse` and `JSON.stringify`. You already met two of tomorrow's errors today: `JSON.parse` throws a `SyntaxError` on bad text (test 2b), and reading a file that doesn't exist throws an error with `code: "ENOENT"`. Tomorrow you decide which of those is a `ValidationError` and which isn't.

A heads-up for Week 4: `try/catch` does **not** catch an error thrown later inside a `setTimeout` callback. The `try` block has already finished by then. `async/await` is what makes `try/catch` work again for code that waits.
