# Week 3, Day 5 - Expense tracker, part 1: the core

**Theme:** turning the Day 4 pieces into a real tool. Over Days 5 and 6 you build a CLI expense tracker that you run like this:

```
node expenses.js add 2500 "lunch with team" food
node expenses.js list
node expenses.js total
node expenses.js remove 2
```

Today you build the **core** in `lib/expenses.js`: the rules (amounts, descriptions, categories, ids) and the load → check → change → save function. You don't touch the terminal at all today. Tomorrow (Day 6) the CLI is a thin layer on top.

Why split it this way? The core can be tested with plain function calls and fixed inputs. The terminal part (reading what the user typed, printing, exit codes) is hard to test, so you keep it as small as possible. Payment services are built the same way: the rules live in plain functions, and the HTTP layer (Phase 2) only calls them.

The payment angle:

1. **Humans type naira, the system stores kobo.** `"25.50"` has to become exactly `2550`, never `2549.9999`. Every checkout page and every payout form has this conversion somewhere, and if it uses floats it's a bug.
2. **The server picks the id and the time, not the caller.** If a caller can send their own `id` or `createdAt` (or `status: "succeeded"`), they can overwrite records or fake history.
3. **Ids are never reused.** Once `#2` has existed, a new record must never be `#2` again, or old receipts, logs and refunds point to the wrong thing.
4. **A broken record in our own file is our problem.** It's a plain `Error` (500), not the user's fault.

**By the end of today I can:**

- Explain why `1.15 * 100` isn't `115`, and convert naira text to kobo without floats
- Use `split`, `trim`, `padEnd` and destructuring to take a string apart safely
- Write a validator that returns a **clean copy** and drops keys the caller shouldn't control
- Pick the next id as "biggest id + 1" and say why "length + 1" breaks
- Pass the current time **into** a function (`now`) so it can be tested
- Group and total a list by category with `reduce` or a loop

---

## 1. Learn (60 min)

| Minutes | Topic                                                                                          | Read for                                                                                               |
| ------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 15      | javascript.info: "Numbers", the section "Imprecise calculations"                               | why `0.1 + 0.2` and `1.15 * 100` are off, and why **whole** numbers up to `MAX_SAFE_INTEGER` are exact |
| 10      | MDN: `String.prototype.split()`, `trim()`, `padEnd()`                                          | what `"12.".split(".")` and `"12".split(".")` return (try both in `node`)                              |
| 15      | javascript.info: "Date and time": creating dates, `toISOString`; MDN: "Date", invalid dates    | what `new Date("nope")` gives, and how `getTime()` tells you (it's `NaN`)                              |
| 10      | MDN: `Array.prototype.includes()`, `Number.isSafeInteger()`                                    | `includes` for "is this one of the allowed values?"                                                    |
| 10      | Stripe docs: search "smallest currency unit" (the page on amounts and zero-decimal currencies) | Stripe wants `2550` for ₦25.50, never `25.5`. Paystack does the same with kobo                         |

Try these in `node` before you start (predict first):

```js
1.15 * 100;
Number("12abc");
parseFloat("12abc");
Number("");
"25.5".split(".");
"5".padEnd(2, "0");
new Date("nope").getTime();
```

`parseFloat("12abc")` gives `12`. It reads as far as it can and ignores the rest. For money that's dangerous: a typo becomes a real amount.

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

You write functions in `lib/expenses.js`. The tests are in `exercises15.js` (already written, don't change the expected values). Run `node exercises15.js` after each exercise.

| #   | Exercise                                                 | Rough time |
| --- | -------------------------------------------------------- | ---------- |
| 0   | Set-up: move `loadJson`/`saveJson` into `lib/files.js`   | 10         |
| 1   | `nairaToKobo` (**hardest**)                              | 25         |
| 2   | `validateExpense`                                        | 15         |
| 3   | `nextId`                                                 | 10         |
| 4   | `loadExpenses` and `addExpense`                          | 15         |
| 5   | `summarize`                                              | 10         |
| 6   | Think (comments only, at the bottom of `exercises15.js`) | 5          |

Rules (same as always):

- **Contract first** for every function (input, output, empty, bad input).
- **Predict first, then run.**
- **Don't edit an expected value** to make a test pass. Every expected value in `exercises15.js` has been checked against a working solution.
- **Time-box rule:** stuck for 20 minutes? Ask for a hint. Exercise 1 is the most likely.
- **`npm run lint`** before committing. Until every stub is written you'll see `no-unused-vars` warnings for their parameters (and for `removeExpense`, which is tomorrow). That's expected.

---

### Exercise 0: Set-up (10 min)

1. **Make `lib/files.js`.** `loadJson` and `saveJson` are needed by Day 4, Day 5 and Day 6. One rule, one place.
   - Create `lib/files.js` with `const fs = require("fs");` at the top.
   - Cut `loadJson` and `saveJson` **with their contracts** out of `exercises14.js` and paste them in.
   - Add `module.exports = { loadJson, saveJson };`
   - In `exercises14.js`, add `const { loadJson, saveJson } = require("./lib/files");` next to the other `require` lines. Keep `require("fs")` there: the tests still use it.
   - Run `node exercises14.js`. Expected: the same 58 PASS lines as before, no FAIL.
2. **`.gitignore`.** Replace the line `tmp-day14/` with `tmp-day*/` (one pattern for every day's scratch folder). Then add:
   ```
   # My own expense data (Days 5-6)
   expenses.json
   ```
   Your real spending is personal data. It doesn't belong on GitHub.

Expected after Exercise 0: `node exercises15.js` prints `PASS - 1a the float trap`, then crashes with `Error: TODO: write nairaToKobo`.

---

### Exercise 1: `nairaToKobo` (25 min, hardest)

`nairaToKobo(text)` turns what a person typed (`"25.50"`) into whole kobo (`2550`). Read `isDigits` at the top of `lib/expenses.js` first: it's already written and you'll use it twice.

**No `parseFloat`, no `* 100` on a decimal.** You split the text at the dot and work with two whole numbers, which JavaScript stores exactly.

Steps:

1. If `text` is **not a string**, throw `new ValidationError("Amount must be text", "amount")`.
2. Trim it, then split it at `"."`. If there are **more than 2** pieces, it's invalid (`"1.2.3"`).
3. Call the pieces `whole` and `fraction` (destructuring: `const [whole, fraction] = parts;`). If there was no dot, `fraction` is `undefined`.
4. `whole` must pass `isDigits`. This one check refuses `""`, `"-5"`, `".5"`, `"1e3"`, `"1,000"`, `"abc"` and `"12abc"`.
5. If `fraction` is **not** `undefined`, it must pass `isDigits` **and** be at most 2 characters. This refuses `"12."` (fraction is `""`) and `"12.345"`.
6. Work out the kobo: `Number(whole) * 100` plus the fraction as kobo. The fraction needs padding: `"5"` means 50 kobo, not 5. Use `padEnd(2, "0")`. No fraction means 0 kobo.
7. The result must pass `isValidAmount`. This refuses `"0"`, `"0.00"` and amounts above `MAX_KOBO`.
8. Return the kobo.

Every invalid case (steps 2, 4, 5, 7) throws `new ValidationError(`Invalid amount: ${text}`, "amount")`, using the **original** `text`, not the trimmed one.

Hint: you'll throw the same error in four places. You can write it four times, or make a small helper inside the function, e.g. `const invalid = () => new ValidationError(...)` and then `throw invalid();`.

Worked examples:

| Input            | `whole`  | `fraction`     | Kobo                                               |
| ---------------- | -------- | -------------- | -------------------------------------------------- |
| `"2500"`         | `"2500"` | `undefined`    | 250000 + 0 = **250000**                            |
| `"25.5"`         | `"25"`   | `"5"` → `"50"` | 2500 + 50 = **2550**                               |
| `"0.05"`         | `"0"`    | `"05"`         | 0 + 5 = **5**                                      |
| `"1.15"`         | `"1"`    | `"15"`         | 100 + 15 = **115**                                 |
| `" 12.30 "`      | `"12"`   | `"30"`         | **1230**                                           |
| `"12."`          | `"12"`   | `""`           | invalid (step 5)                                   |
| `"999999999999"` | 12 nines | `undefined`    | 99999999999900, above `MAX_KOBO`: invalid (step 7) |

Why is `Number(whole) * 100` safe when `1.15 * 100` isn't? `whole` is a whole number, and whole numbers multiply exactly (up to `MAX_SAFE_INTEGER`, and `isValidAmount` stops anything near that). Only fractions are stored approximately.

Expected: Section 1 all PASS. Each 1c line shows the error message in brackets, so if one fails you can see what your function threw.

---

### Exercise 2: `validateExpense` (15 min)

`validateExpense(input)` checks one expense **after** the amount is already kobo. It follows the same pattern as `validateTransaction` from Day 4 (look at it in `exercises14.js`).

Check **in this order**, and throw a `ValidationError` for the first bad field:

| Order | Field         | Rule                                                                                            | Message (exact)                                                     |
| ----- | ------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1     | `input`       | must be an object, not `null`, not an array                                                     | `Expense must be an object`                                         |
| 2     | `amount`      | must pass `isValidAmount`                                                                       | `` `Invalid amount: ${amount}` ``                                   |
| 3     | `description` | must be a string that isn't empty after `trim()`                                                | `Description is required`                                           |
| 3     | `description` | trimmed length at most `MAX_DESCRIPTION` (100)                                                  | `` `Description is too long (max ${MAX_DESCRIPTION} characters)` `` |
| 4     | `category`    | `undefined` means `"other"`. Otherwise a string whose `trim().toLowerCase()` is in `CATEGORIES` | `` `Invalid category: ${category}` `` (the original value)          |

Return a **new** object with exactly these keys, in this order: `{ amount, description, category }`, with the description trimmed and the category trimmed and lowercased.

Hint: a destructuring default (`const { category = "other" } = input;`) only replaces `undefined`. `null` stays `null`, and test 2d expects `null` to be refused. That's what you want.

Hint: `checkList` compares JSON text, so key order matters. `{ description, amount }` would FAIL against `{ amount, description }`.

Expected: Section 2 all PASS. Test 2c is the security one: `id` and `createdAt` sent by the caller are **not** in the result.

---

### Exercise 3: `nextId` (10 min)

`nextId(list)` returns the id for the next new expense: **the biggest id in the list + 1**. An empty list gives `1`.

While going through the list, check every item **before** reading `.id`: the item must be an object, not `null`, and its `id` must be a safe integer of at least 1. Otherwise throw a plain `Error` (not `ValidationError`) with the message `` `Bad record in expenses file: ${JSON.stringify(item)}` ``.

This answers your Day 4 question about `[null]`: `null.id` crashes with a `TypeError`, so you check for `null` first and give a clear error instead.

Hint: `reduce` with an initial value of `0` works well: the accumulator is "biggest id so far".

Expected:

| List                                                        | Result                                    |
| ----------------------------------------------------------- | ----------------------------------------- |
| `[]`                                                        | `1`                                       |
| ids `1, 2, 3`                                               | `4`                                       |
| ids `1, 5, 2`                                               | `6`                                       |
| ids `1, 3` (after `#2` was removed)                         | `4`                                       |
| `[null]`, `[{ id: "2" }]`, `[{ id: 0 }]`, `[{ id: 1 }, {}]` | `Error`: `Bad record in expenses file...` |

---

### Exercise 4: `loadExpenses` and `addExpense` (15 min)

**`loadExpenses(filePath)`** (3 lines): `loadJson(filePath, [])`, then if the result is not an array, throw a plain `Error` with `` `Expected an array in ${filePath}` ``. Return the list. This is the shape check from Day 4's `recordTransaction`, now in one place so `add`, `list`, `total` and `remove` all use it.

**`addExpense(filePath, input, now)`** returns the new expense record. Do these **in this order**:

1. `const fields = validateExpense(input);` Let errors escape.
2. Check `now`: if it is not a `Date` (`instanceof`), or its `getTime()` is `NaN`, throw a plain `Error("now must be a valid Date")`. A bad clock is a bug in **our** code, not the user's input.
3. `loadExpenses(filePath)`.
4. Build the record with exactly these keys in this order: `{ id, amount, description, category, createdAt }`. `id` comes from `nextId(list)`; `createdAt` is `now.toISOString()`.
5. Push it, `saveJson`, and return the record.

Why does `now` come in as a parameter instead of `new Date()` inside? See Think question 1.

Steps 1 and 2 come before step 3, so bad input or a bad clock never touches the disk (tests 4c and 4d).

Expected: 4b the first record is exactly `{ id: 1, amount: 250000, description: "lunch", category: "food", createdAt: "2026-11-08T12:00:00.000Z" }`, then ids 2 and 3, and 3 records on disk. 4c-4e: refused, and the files are unchanged.

---

### Exercise 5: `summarize` (10 min)

`summarize(list)` takes a list of expense records (already valid: they came from `addExpense`) and returns `{ count, total, byCategory }`:

- `count`: how many records
- `total`: the sum of all `amount`s, in kobo
- `byCategory`: an object with one key per category that **appears** in the list, holding that category's total. Keys appear in the order each category is first seen. Categories with no expenses are **not** included.

Hint: this is `countByStatus` from Week 2 Day 4 again, but you add `amount` instead of `1`.

Expected:

| List                          | Result                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------- |
| `[]`                          | `{ count: 0, total: 0, byCategory: {} }`                                                    |
| food 100, bills 200, food 300 | `{ count: 3, total: 600, byCategory: { food: 400, bills: 200 } }`                           |
| the file from Section 4       | `{ count: 3, total: 375000, byCategory: { food: 250000, transport: 75000, other: 50000 } }` |

Test 5d is an independent self-check: it adds up `byCategory` outside `summarize` and compares the result with `total`.

---

### Exercise 6: Think (5 min, comments only, Section 6)

1. Why does `addExpense` take `now` as a parameter instead of calling `new Date()` inside? Look at test 4b: what could it check if `addExpense` used the real time?
2. `nextId` uses "biggest id + 1", not `list.length + 1`. Take the list with ids `1, 3` (after `#2` was removed). What would `length + 1` give, and what goes wrong the next time you add? In payments, why must an id never be reused, even after a record is deleted?
3. Test 2c: `validateExpense` drops `id` and `createdAt` from the input. Suppose it returned `{ ...input }` instead. What could someone do through an API that let a customer send `status: "succeeded"` or `amount_paid` in the request body?
4. `Math.round(parseFloat("1.005") * 100)` gives `100`, not `101`. `nairaToKobo` refuses `"12.345"` instead of rounding it. Why is refusing safer than rounding when you don't know what the person meant?

---

## 3. Review (30 min)

1. Ask Claude: "Review `lib/files.js` and `lib/expenses.js`".
2. Add a **Week 3, Day 5** entry to `LEARNING.md` with your 3 "still unsure" items and any wrong predictions.
3. Commit and push.

```bash
npm run lint
node exercises14.js
node exercises15.js
git status          # tmp-day15 must NOT be listed
git add .
git commit -m "feat: Week 3 Day 5 - expense tracker core"
git push
```

---

## Coming next: Day 6

The CLI itself (`expenses.js`): reading what the user typed from `process.argv`, `removeExpense`, printing with `formatNaira`, and exit codes so other programs can tell success from failure. Then you use the tracker for real, followed by the Week 3 quiz.
