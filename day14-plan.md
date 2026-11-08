# Week 3, Day 4 - Files and JSON

**Theme:** making data outlive the program. Until now, every transaction you created disappeared when `node` finished. Today you save data to a file as JSON and read it back next time. On Days 5-6 the CLI expense tracker is built on today's functions, so build them carefully.

The payment angle:

1. **JSON is how payment data travels.** Every API request body, every webhook from Paystack or Stripe, and every response you send back is JSON text. `JSON.parse` turns that text into objects. It does **not** check the data: `{"amount":"5000"}` parses fine and gives you a string. Validation still comes after parsing.
2. **Bad JSON from a caller and a broken file of your own are different problems.** A merchant sending broken JSON gets a 400. Your own ledger file being corrupt is a 500 and an alert to you (yesterday's rule, applied to files).
3. **Never "fix" bad data by overwriting it.** If the ledger file can't be read, the safe move is to stop. Replacing it with `[]` deletes every transaction you had.
4. **A missing file and an unreadable file are different too.** "No ledger yet" on the first run is normal. "Can't read the ledger" is not.

**By the end of today I can:**

- Predict what `JSON.stringify` does with `undefined`, `NaN`, `Date` and nested arrays, and what comes back from `JSON.parse`
- Explain why a big ID or amount should be sent as a string in JSON
- Read and write a file with `fs.readFileSync` and `fs.writeFileSync`, using `"utf8"`
- Build file paths with `path.join` and `__dirname`, and say why a relative path can break
- Tell a missing file (`ENOENT`) apart from other read errors by checking `error.code`
- Choose the right error for bad JSON: `ValidationError` (caller's fault) or plain `Error` (our fault)
- Write a load → check → change → save function that refuses bad input before touching the disk

Support-job tie-in: "Unexpected token" and "Unexpected end of JSON input" are two of the most common errors in customer logs and tickets. After today you'll know what each one means and the usual cause (a cut-off response, an HTML error page where JSON was expected, single quotes).

---

## 1. Learn (60 min)

| Minutes | Topic                                                                                        | Read for                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 20      | javascript.info: "JSON methods, toJSON"                                                      | what `JSON.stringify` skips (`undefined`, functions), the `space` argument, why a `Date` becomes a string             |
| 10      | MDN: "JSON.parse()", the Exceptions section; then "Number.MAX_SAFE_INTEGER"                  | which error bad text throws; why `9007199254740993` can't be stored exactly                                           |
| 15      | nodejs.org/learn: "Reading files with Node.js", then "Writing files with Node.js"            | `readFileSync(path, "utf8")`, `writeFileSync` replaces the whole file. Skip the `fs/promises` parts: those are Week 4 |
| 10      | Node.js docs: "Path", read only `path.join`; then "Modules: CommonJS", read only `__dirname` | why a relative path like `"data.json"` depends on the folder you run `node` from                                      |
| 5       | Node.js docs: "Errors", the "Common system errors" list                                      | `ENOENT`, `EISDIR`, `EACCES`: what each `code` means                                                                  |

The two JSON functions:

| Function                         | Goes from    | Throws when                                               | Quietly changes                                                                                                                                                                            |
| -------------------------------- | ------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `JSON.stringify(value, null, 2)` | value → text | a circular object, or a `BigInt`                          | drops `undefined` and functions in objects, turns them into `null` in arrays, `NaN` → `null`, `Date` → ISO string. Returns `undefined` (not text) for `undefined` or a function on its own |
| `JSON.parse(text)`               | text → value | the text isn't valid JSON (`SyntaxError`), including `""` | numbers beyond `MAX_SAFE_INTEGER` lose digits                                                                                                                                              |

JSON rules that catch people: keys and strings need **double** quotes, no trailing commas, no comments, no `undefined`.

Sync vs async: today you use `readFileSync`/`writeFileSync`. They make the program wait until the disk is done. That's fine for a CLI tool, but a server handling many requests would stall. Week 4 switches to the async versions.

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Everything happens in `exercises14.js` (already written up to the parts you fill in), plus a small change to `lib/testing.js` and `exercises13.js`.

| #   | Exercise                                                             | Rough time |
| --- | -------------------------------------------------------------------- | ---------- |
| 0   | Set-up: move `catchError` into `lib/testing.js`, ignore `tmp-day14/` | 10         |
| 1   | Predict JSON (predictions only)                                      | 15         |
| 2   | `parseJson`: bad JSON from a caller is a 400                         | 15         |
| 3   | `loadJson`: read a file we own                                       | 20         |
| 4   | `saveJson`: write a file, and never write nothing                    | 10         |
| 5   | `recordTransaction` (**hardest**)                                    | 15         |
| 6   | Think (comments only)                                                | 5          |

Rules for today (same as before):

- **Contract first** for every function you write (input, output, empty, bad input).
- **Predict first, then run.**
- **Don't edit an expected value** to make a test pass unless you've worked it out by hand. Every expected value in `exercises14.js` has been checked against a working solution.
- **Time-box rule:** stuck for 20 minutes? Ask for a hint. Exercise 3 or 5 is the most likely.
- **Run `npm run lint`** before you commit. While stubs are unfinished you'll see `no-unused-vars` warnings for their parameters; they go away as you write each function.

Run the file after each exercise: `node exercises14.js`. Sections you haven't reached yet crash with `Error: TODO: write <name>`.

**About the `tmp-day14/` folder:** the top of `exercises14.js` deletes and recreates a folder called `tmp-day14` next to the file on every run, so each run starts with clean test files. You can open it in VS Code after a run to see exactly what your functions wrote. The path is a fixed constant on purpose: never give `fs.rmSync` a path that came from user input.

---

### Exercise 0: Set-up (10 min)

1. **Move `catchError` into `lib/testing.js`.** You wrote it yesterday inside `exercises13.js`, and today's file needs it too. One rule, one place (Day 2 lesson).
   - Cut the function **and its contract** from `exercises13.js` and paste them into `lib/testing.js`.
   - Add it to `module.exports` in `lib/testing.js`.
   - In `exercises13.js`, add `catchError` to the `require("./lib/testing")` line at the top.
   - Run `node exercises13.js`. Expected: the same result as yesterday (only the 3b FAIL line, which is expected).
2. **Ignore the scratch folder.** Add `tmp-day14/` to `.gitignore` under a comment such as `# Test files made by exercises`. Then run `node exercises14.js` once and run `git status`: `tmp-day14` must **not** appear.

Expected after Exercise 0: `node exercises14.js` runs all of Section 1, then crashes with `Error: TODO: write parseJson`.

---

### Exercise 1: Predict JSON (15 min)

Section 1 is already written. For each test, write your prediction in the comment **before** running.

- 1a-1d: one object with `undefined`, `NaN` and a `Date` inside, sent through `JSON.stringify` and back with `JSON.parse`. Which keys survive, and what type is each value afterwards?
- 1e: the same `undefined`, but inside an array.
- 1f: your own `checkList` helper. Will `[undefined]` and `[null]` count as equal? Your contract comment in `lib/testing.js` already warns about this. Now you'll see why.
- 1g: a 16-digit number. `9007199254740993` is one more than `Number.MAX_SAFE_INTEGER`.
- 1h: a number in quotes.
- 1i: single quotes. Is that valid JSON?
- 1j: the `space` argument (`2`). Work out where each newline goes. `\n` is a newline.

Payment note for 1g: some providers send IDs and large amounts as **strings** in JSON for exactly this reason. If you parse a 17-digit transaction ID as a number, you get a different ID, and you could match a payment to the wrong order.

---

### Exercise 2: `parseJson` (15 min)

`parseJson(text)` is how an API turns a request body into an object. If the body is broken, that's the caller's fault, so it must be a `ValidationError` (which `toHttpStatus` maps to 400).

1. If `text` is **not a string**, throw `new ValidationError("JSON text must be a string", "body")`.
   Why check first? Predict `JSON.parse(42)`, then try it with `node -e "console.log(JSON.parse(42))"`. It doesn't throw. `JSON.parse` turns its input into a string first, so `42` becomes `"42"`, which is valid JSON.
2. Call `JSON.parse(text)` inside a `try` and return the result.
3. In the `catch`: if the error is a `SyntaxError`, throw a **new** `ValidationError` with field `"body"`, a message starting `Invalid JSON` (e.g. `` `Invalid JSON: ${error.message}` ``), and `{ cause: error }`.
4. Anything else: rethrow it unchanged. Catch only what you understand.

Expected: 2a returns the parsed values (including `null` for the text `"null"`, which is valid JSON). 2b/2c: `ValidationError`, field `"body"`, with the `SyntaxError` as `cause`. 2d: `42` and `undefined` give exactly `"JSON text must be a string"`.

---

### Exercise 3: `loadJson` (20 min)

`loadJson(filePath, fallback)` reads a JSON file **that our program owns** (the ledger) and returns what's in it.

Before you write it, do **3a** in the file: uncomment the two lines, run, and write down the `.code` of a missing-file error. Then comment them out again.

1. **Read** the file with `fs.readFileSync(filePath, "utf8")` inside a `try`.
   - If the error's `code` is `"ENOENT"` (no such file), return `fallback`. This is normal: on the first run there is no ledger yet.
   - **Any other** read error: rethrow it unchanged. A folder instead of a file, or no permission, is not "no data yet".
2. **Parse** the text with `JSON.parse` inside a **second** `try`. If it throws, throw a new `Error` with the message `` `Corrupt JSON in ${filePath}` `` and `{ cause: error }`.
   - Use a plain `Error`, **not** `ValidationError`, and don't call `parseJson`. The file is ours, so a broken file is our problem (500), not the caller's (400).
3. Return the parsed value.

Hint: the text is read in the first `try` and used after it. Where must you declare the variable? (Same block-scope problem as `status` in yesterday's `validatePayment`.)

Hint: use two separate `try` blocks, not one big one. With one big `try`, how would your `catch` tell "the file is missing" apart from "the file is corrupt"?

Expected: 3b `[{ id: "tx_1", amount: 5000 }]`. 3c the fallback, exactly as passed in (`[]`, then `null`), and the missing file is still missing afterwards. 3d/3e a plain `Error` starting `Corrupt JSON in` that includes the file name, with a `SyntaxError` as `cause`. An **empty** file is corrupt, not missing. 3f reading a folder escapes with `code` `"EISDIR"`.

---

### Exercise 4: `saveJson` (10 min)

`saveJson(filePath, data)` writes `data` to a file as pretty JSON.

1. Turn `data` into text with `JSON.stringify(data, null, 2)`.
2. If the result is **not a string**, throw `new Error("Nothing to save: data is not JSON")` and **don't** write anything. This happens when `data` is `undefined` or a function (see the table in Learn).
3. Add a newline (`"\n"`) to the end of the text. Text files traditionally end with one, and Prettier and Git expect it.
4. Write it with `fs.writeFileSync(filePath, text, "utf8")`. Return nothing.

Why step 2 matters for money: `writeFileSync` replaces the whole file. One bad call with `undefined` would turn your ledger into the word `undefined`, and every record would be gone.

Expected: 4a exact text `'[\n  {\n    "id": "tx_1",\n    "amount": 5000\n  }\n]\n'`. 4b `loadJson` reads back the same data. 4c saving `[]` replaces the file with `"[]\n"`. 4d both refusals start with `Nothing to save` and the file is still `"[]\n"`. 4e a `Date` comes back as the string `"2026-11-06T09:30:00.000Z"`.

---

### Exercise 5: `recordTransaction` (15 min, hardest)

`recordTransaction(filePath, input)` adds one transaction to a ledger file. This is load → check → change → save, the shape of almost every "update a record" function you'll write. `validateTransaction` is already written in Section 5: read it and its contract first.

Do these steps **in this order**:

1. **Validate:** `const tx = validateTransaction(input)`. If it throws, let it escape. Don't catch it. Validating before you touch the disk means bad input can't create or change a file (tests 5e).
2. **Load:** `loadJson(filePath, [])`. A missing file means an empty ledger. A corrupt file throws, and you let it escape (test 5g: the corrupt file must be left exactly as it was).
3. **Check the shape:** if what you loaded is not an array, throw a new `Error` with the message `` `Expected an array in ${filePath}` ``. Plain `Error`: the file is ours.
4. **Duplicate check:** if any transaction in the list already has `tx.id`, return `{ added: false, count: list.length }` **without saving**. A duplicate is not an error. The same transaction arriving twice is normal in payments (a retried request, a webhook sent twice), and the answer must be the same as the first time.
5. **Add and save:** push `tx` onto the list, `saveJson(filePath, list)`, and return `{ added: true, count: list.length }`.

Hint for step 4: which array method answers "does **any** item match?" `find` works too, but there's a method whose name says exactly that.

Expected:

| Test | Call                                                | Returns / result                                                         |
| ---- | --------------------------------------------------- | ------------------------------------------------------------------------ |
| 5a   | `tx_1`, 5000, `"succeeded"` on a new file           | `{ added: true, count: 1 }`, file now exists                             |
| 5b   | `tx_2`, 2500, `" PENDING "`                         | `{ added: true, count: 2 }`, statuses on disk `["succeeded", "pending"]` |
| 5c   | `tx_1` again (same, then with amount 9999)          | `{ added: false, count: 2 }` both times; `tx_1` still 5000 on disk       |
| 5d   | `tx_3`, amount `-1`                                 | `ValidationError`, field `"amount"`; ledger still has 2                  |
| 5e   | bad input on a new path; bad id on the corrupt file | no file created; field `"id"` (not "Corrupt JSON")                       |
| 5f   | file contains `{"id":"tx_1"}`                       | plain `Error` starting `Expected an array in`                            |
| 5g   | valid input, corrupt ledger                         | `Corrupt JSON in ...`; file text still `[{"id":"tx_1",`                  |
| 5h   | self-check                                          | records on disk = the `count` 5b returned (2)                            |

---

### Exercise 6: Think (5 min, comments only, in Section 6)

1. Two copies of your program run `recordTransaction` on the same ledger at the same moment: one adds `tx_5`, the other adds `tx_6`. Walk through load, push and save for both, step by step. What's in the file at the end? (This is the "two requests at once" bug from Phase 3.)
2. Test 5c: a second `tx_1` arrived with amount 9999 instead of 5000, and `recordTransaction` quietly said `added: false`. Is quietly ignoring it right? What would you want to happen instead, and who should find out?
3. If the power goes off halfway through `writeFileSync`, what could `ledger.json` contain? What does `loadJson` do with it on the next run? A common fix is to write to `ledger.json.tmp` first and then rename it over `ledger.json` (`fs.renameSync`). Why does that help?
4. Why is bad JSON in a **request body** a 400 (`parseJson` → `ValidationError`), but bad JSON in **our ledger file** a 500 (`loadJson` → plain `Error`)? The `SyntaxError` underneath is the same.
5. `loadJson` returns the fallback when the file is missing. Why would it be dangerous if it also returned the fallback when the file was **corrupt**? Think about what step 5 of `recordTransaction` does next.

---

## 3. Review (30 min)

1. Ask Claude: "Review `lib/testing.js` and `exercises14.js`".
2. Add a **Week 3, Day 4** entry to `LEARNING.md` with your 3 "still unsure" items and anything from Section 1 you predicted wrong.
3. Commit and push.

```bash
npm run lint
node exercises13.js
node exercises14.js
git status          # tmp-day14 must NOT be listed
git add .
git commit -m "feat: Week 3 Day 4 - files and JSON"
git push
```

---

## Coming next: Days 5-6

The CLI expense tracker. You'll run it like `node expenses.js add 2500 "lunch"` and `node expenses.js list`, and it saves to a JSON file. Today's `loadJson`, `saveJson` and the load → check → change → save shape are its core, so you'll move them into a `lib/` module. New pieces: reading command-line arguments with `process.argv`, and storing a date with each expense (ISO strings from 4e). Then the Week 3 quiz.
