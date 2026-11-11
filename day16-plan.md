# Week 3, Day 6 - Expense tracker, part 2: the CLI, then the Week 3 quiz

**Theme:** a thin layer between a person and the core. Yesterday's `lib/expenses.js` holds all the rules. Today `expenses.js` reads what the user typed, calls the core, prints the result, and reports success or failure with an **exit code**. Then you use the tracker for real and take the Week 3 quiz.

The design you're building:

| Function                          | Where             | Knows about the terminal?                     | Tested by        |
| --------------------------------- | ----------------- | --------------------------------------------- | ---------------- |
| `nairaToKobo`, `addExpense`, ...  | `lib/expenses.js` | No                                            | `exercises15.js` |
| `runCommand(args, filePath, now)` | `expenses.js`     | No: takes words, **returns** lines            | `exercises16.js` |
| `main()`                          | `expenses.js`     | Yes: `process.argv`, `console.log`, exit code | you, by hand     |

`main` is the only untested part, so it must be tiny.

The payment angle:

1. **Same core, many front doors.** Today the front door is a terminal. In Phase 2 it's an Express route, in Phase 4 a webhook handler. The rules in `lib/` stay the same. Only the thin layer changes.
2. **Two kinds of failure, two answers.** A typing mistake (`add 12.345 lunch`) is the user's to fix: a short message and exit code 1, like a 400. A broken data file is ours: full details and exit code 2, like a 500.
3. **Exit codes are how programs talk to programs.** Scripts and CI pipelines (Phase 4) never read your messages. They only check whether the exit code was 0.
4. **Real ledgers don't delete.** Today's `remove` really deletes a row. That's fine for personal spending, but a payment ledger never does it. Think question 3 explains why.

**By the end of today I can:**

- Read command-line words with `process.argv.slice(2)`
- Explain why `runCommand` returns lines instead of printing them
- Use `console.error` for errors and set `process.exitCode`, and check it in PowerShell with `$LASTEXITCODE`
- Explain why `isDigits` is needed before `Number("2.0")`
- Remove an item with `findIndex` and `splice` without changing the file when the id doesn't exist
- Explain what `require.main === module` does

---

## 1. Learn (30 min)

Shorter today, so there's time for the quiz.

| Minutes | Topic                                                                 | Read for                                                                                        |
| ------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 10      | nodejs.org/learn: "Node.js, accept arguments from the command line"   | what `process.argv[0]` and `[1]` are, and why you `slice(2)`                                    |
| 10      | Node.js docs: "Process", read `process.exitCode` and `process.exit()` | why setting `exitCode` is gentler than calling `exit()`: `exit()` stops at once, even mid-write |
| 5       | MDN: `console.error()`                                                | errors go to **stderr**, normal output to **stdout**, so a script can keep them apart           |
| 5       | MDN: `Array.prototype.findIndex()` and `splice()`                     | what `findIndex` returns when nothing matches (`-1`), and what `splice` returns (an **array**)  |

Try in a terminal (PowerShell):

```powershell
node -e "console.log(process.argv)" add 2500 "lunch with team"
node -e "process.exitCode = 3"; $LASTEXITCODE
```

Notice:

- `"lunch with team"` arrives as **one** word because of the quotes. Without quotes it would be three.
- With `node -e` there is no script file, so the array is `[node path, "add", ...]` and your words start at index 1. When you run a real file (`node expenses.js add ...`), index 1 is the path to `expenses.js`, so your words start at index **2**. That's why `main` uses `slice(2)`.

Write down 3 things you are still unsure about.

---

## 2. Build (90 min)

| #   | Exercise                                                 | Where             | Rough time |
| --- | -------------------------------------------------------- | ----------------- | ---------- |
| 1   | `removeExpense`                                          | `lib/expenses.js` | 15         |
| 2   | `runCommand` (**hardest**)                               | `expenses.js`     | 40         |
| 3   | `main`                                                   | `expenses.js`     | 10         |
| 4   | Use it for real                                          | terminal          | 15         |
| 5   | Think (comments only, at the bottom of `exercises16.js`) | `exercises16.js`  | 10         |

Run `node exercises16.js` after Exercises 1 and 2. Same rules as always: contract first, predict first, don't edit expected values, ask for a hint after 20 minutes stuck (Exercise 2 is the likely one).

---

### Exercise 1: `removeExpense` (15 min)

`removeExpense(filePath, id)` removes one expense and returns the removed record. `id` is a number here (the CLI converts it in Exercise 2).

In this order:

1. `id` must be a safe integer of at least 1. Otherwise throw `new ValidationError(`Invalid id: ${id}`, "id")`. Before touching the disk.
2. `loadExpenses(filePath)`.
3. Find the **index** of the record with that id. If there isn't one, throw `new ValidationError(`No expense with id ${id}`, "id")` **without saving**.
4. Remove it with `splice`, `saveJson`, and return the removed record.

Hint: `splice` returns an **array** of what it removed, even for one item. `const [removed] = list.splice(index, 1);` takes the first one out.

Why is "no such id" a `ValidationError`? The caller asked for something that doesn't exist: that's their request, not our bug. In an API it would be a 404. We don't have a `NotFoundError` class yet, so `ValidationError` (the caller's fault) is the closest.

Expected: 1a returns the `taxi` record and leaves ids `[1, 3]`. 1b removing `#2` again: `No expense with id 2`, file unchanged. 1c `0`, `-1`, `1.5`, `"1"`, `undefined` all give `Invalid id: <value>`. 1d a missing file: `No expense with id 1`, and no file is created.

---

### Exercise 2: `runCommand` (40 min, hardest)

`runCommand(args, filePath, now)` runs one command and **returns an array of output lines**. It never prints. `args` is what the user typed after `node expenses.js`, already split into words: `node expenses.js add 2500 lunch food` gives `["add", "2500", "lunch", "food"]`.

`args[0]` is the command:

| Command            | Allowed `args.length` | What to do                                                                                                    | Returns (exact)                                                                                                                                                                                                                                    |
| ------------------ | --------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| nothing, or `help` | any                   | nothing                                                                                                       | `USAGE` (already defined at the top)                                                                                                                                                                                                               |
| `add`              | 3 or 4                | `nairaToKobo(args[1])`, then `addExpense(filePath, { amount, description: args[2], category: args[3] }, now)` | ``[`Added #${id}: ${formatNaira(amount)} ${description} (${category})`]``                                                                                                                                                                          |
| `list`             | exactly 1             | `loadExpenses(filePath)`                                                                                      | empty: `["No expenses yet."]`. Otherwise one line per record: `` `#${id} ${date} ${formatNaira(amount)} [${category}] ${description}` `` where `date` is `createdAt.slice(0, 10)`                                                                  |
| `total`            | exactly 1             | `summarize(loadExpenses(filePath))`                                                                           | first line `` `Total: ${formatNaira(total)} (${count} expenses)` ``, but `expense` (no s) when `count` is 1. Then, for each category in **`CATEGORIES` order** that has a total: `` `  ${category}: ${formatNaira(amount)}` `` (2 spaces in front) |
| `remove`           | exactly 2             | `args[1]` must pass `isDigits`, then `removeExpense(filePath, Number(args[1]))`                               | ``[`Removed #${id}: ${formatNaira(amount)} ${description}`]``                                                                                                                                                                                      |
| anything else      | -                     | -                                                                                                             | throw `ValidationError(`Unknown command: ${args[0]}`, "command")`                                                                                                                                                                                  |

Wrong number of words: throw `ValidationError` with field `"args"` and these exact messages:

- `add`: `Usage: add <amount> <description> [category]`
- `list`: `Usage: list`
- `total`: `Usage: total`
- `remove`: `Usage: remove <id>`

`remove` with a non-digit id: `ValidationError(`Invalid id: ${args[1]}`, "id")`.

Use the values from the **returned record** in the `Added` line, not from `args`: `add 0.5 sweets FOOD` must print `(food)`, not `(FOOD)`.

Why `isDigits` before `Number` for `remove`? Try `Number("2.0")`, `Number(" 2 ")`, `Number("")` and `Number("0x10")` in `node`. Without the check, `remove 2.0` would quietly delete `#2`, and `remove ""` would become `remove 0`.

Hint: one `if` block per command, each ending in `return`, and the "unknown command" `throw` at the very end. `const [command] = args;` gives you the command word (or `undefined` when there are no words).

Hint for `total`: loop over `CATEGORIES`, not over `byCategory`. That gives a fixed order (`food, transport, bills, other`) no matter which expense was added first. Skip a category when `byCategory[category]` is `undefined`.

Expected (fixed time `2026-11-08T12:00:00Z`, see Section 2 of `exercises16.js`):

```
run("add", "2500", "lunch", "food")   -> ["Added #1: ₦2500.00 lunch (food)"]
run("add", "750.50", "taxi home")     -> ["Added #2: ₦750.50 taxi home (other)"]
run("add", "0.5", "sweets", "FOOD")   -> ["Added #3: ₦0.50 sweets (food)"]
run("list") -> ["#1 2026-11-08 ₦2500.00 [food] lunch",
                "#2 2026-11-08 ₦750.50 [other] taxi home",
                "#3 2026-11-08 ₦0.50 [food] sweets"]
run("total") -> ["Total: ₦3251.00 (3 expenses)",
                 "  food: ₦2500.50",
                 "  other: ₦750.50"]
run("remove", "2")                    -> ["Removed #2: ₦750.50 taxi home"]
run("add", "100", "bread")            -> ["Added #4: ₦100.00 bread (other)"]   (not #3)
```

Check the total by hand: 250000 + 75050 + 50 = 325100 kobo = ₦3251.00. Food: 250000 + 50 = 250050 = ₦2500.50.

Test 2f tries 14 user mistakes and then checks the file still has 3 records. Test 2g: a corrupt file must come out as a plain `Error`, not a `ValidationError`.

---

### Exercise 3: `main` (10 min)

`main()` is the only function that touches the terminal. No tests: you check it by hand in Exercise 4.

1. The data file: `const filePath = process.env.EXPENSES_FILE || path.join(__dirname, "expenses.json");`
   `process.env` holds environment variables. This lets you point the tracker at a different file without changing code (Phase 2 uses the same idea for API keys). Normally it's not set, so `expenses.json` next to the script is used.
2. In a `try`: `runCommand(process.argv.slice(2), filePath, new Date())`, then `console.log` the lines joined with `"\n"`.
   This is the one place the real clock is used. Everything below it gets `now` passed in.
3. In the `catch`:
   - `ValidationError` (the user's mistake): `console.error(`Error: ${error.message}`)` and `process.exitCode = 1`.
   - Anything else (our bug or a broken file): `console.error("Unexpected error (this is a bug or a problem with the data file):")`, then `console.error(error)` (the whole error, with its stack and `cause`), and `process.exitCode = 2`.

Don't use `process.exit()`. Setting `process.exitCode` lets Node finish writing output first.

---

### Exercise 4: Use it for real (15 min)

In the VS Code terminal (PowerShell), from the `js-learning` folder. Predict each output before you press Enter.

```powershell
node expenses.js                                   # the usage text
node expenses.js add 2500 "lunch with team" food   # Added #1: ₦2500.00 lunch with team (food)
node expenses.js add 1200 taxi transport           # Added #2: ₦1200.00 taxi (transport)
node expenses.js add 350.75 airtime                # Added #3: ₦350.75 airtime (other)
node expenses.js list                              # 3 lines, with TODAY's date
node expenses.js total                             # Total: ₦4050.75 (3 expenses), then food, transport, other
node expenses.js add 12.345 bread
$LASTEXITCODE                                      # 1
node expenses.js remove 9                          # Error: No expense with id 9
node expenses.js list
$LASTEXITCODE                                      # 0
```

Then:

1. Open `expenses.json` in VS Code. Are the amounts in kobo? Is `createdAt` in UTC (ends in `Z`)?
2. **Break it on purpose:** delete the last `]` in `expenses.json` and save. Run `node expenses.js list`. You should see `Unexpected error ...` with `Corrupt JSON in ...` and the `SyntaxError` as `[cause]`. Check `$LASTEXITCODE`: it should be `2`. Then press Ctrl+Z in the editor to put the `]` back and save.
3. `git status`: `expenses.json` must **not** be listed.

If `₦` shows as strange characters in your terminal, that's the terminal's text encoding, not your code. The tests in `exercises16.js` compare strings, so they're the real check.

Use the tracker for your own spending this week if you like. It's yours.

---

### Exercise 5: Think (10 min, comments only, Section 3 of `exercises16.js`)

1. `list` shows `createdAt.slice(0, 10)`, which is the **UTC** date. You add an expense in Lagos at 00:30 on 9 November (Lagos is UTC+1). What date does `list` show, and why? How could you show the Lagos date while still storing UTC? (Look up `toLocaleDateString` with the `timeZone` option `"Africa/Lagos"`. You don't need to write the code.)
2. You run `add 2500 lunch food`, think it didn't work, press the up arrow and Enter. Now there are two lunches. Day 4's `recordTransaction` refused duplicate ids. Why can't `addExpense` do the same? In an API, what would the client have to send so that a retry can be recognised? (The roadmap calls it an "idempotency key".)
3. `remove` deletes a record. A payment ledger never deletes. A refund is a **new** record that reverses the old one. Give two reasons why. (Think about who might ask "what happened to payment #2?" a month later, and the provider's settlement report.)
4. Why does `main` use exit code 1 for typing mistakes and 2 for a broken file, instead of always 0? Who reads exit codes, if not a person?
5. `main` prints the whole error, with the file path, the stack and the `cause`. That's fine for a tool on your own computer. Why would it be wrong for an API server? (Day 4, Section 6, question 4.)

---

### Stretch (only if you have time left): atomic `saveJson`

Your Day 4 answer to question 3: write to a temporary file, then rename it over the real one, so a crash mid-write can't leave a half-written ledger.

In `lib/files.js`, change `saveJson` to write to `` `${filePath}.tmp` `` and then `fs.renameSync(tmpPath, filePath)`. Update its contract.

Check: `node exercises14.js`, `node exercises15.js` and `node exercises16.js` all still pass, and there are no `.tmp` files left in `tmp-day15/` or `tmp-day16/` after a run.

---

## 3. Review and Week 3 quiz (30 min + quiz)

1. Ask Claude: "Review `lib/expenses.js` and `expenses.js`".
2. Add a **Week 3, Day 6** entry to `LEARNING.md` (3 "still unsure" items, anything you predicted wrong).
3. Commit and push:

```bash
npm run lint        # no warnings now: every stub is written
node exercises15.js
node exercises16.js
git status          # tmp-day16 and expenses.json must NOT be listed
git add .
git commit -m "feat: Week 3 Day 6 - expense tracker CLI"
git push
```

4. **Week 3 quiz:** ask Claude "Week 3 quiz". Five questions covering destructuring and spread, modules, `try/catch` and custom errors, files and JSON, and the expense tracker. Answer from memory first, without looking at your code. Record the score in the quiz table in `LEARNING.md`.
5. After the quiz, ask for the **Week 3 study notes** (the end-of-week write-up of your code and helpers).

---

## Coming next: Week 4

Async JavaScript: callbacks, Promises, `async/await`, the event loop and `Promise.all`. The first change: `readFileSync` becomes `await readFile`, because a server can't wait on the disk while other customers are waiting.
