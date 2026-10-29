# Week 3, Day 1 - ESLint, destructuring, spread, template strings

**Theme:** taking data apart and copying it safely. Every API you'll ever call sends you a big object, and you only want a few fields from it. Today you learn to pull out exactly the fields you want (destructuring), to make a changed copy without touching the original (spread), and to build clean text output from values (template strings).

The payment angle runs through all of it:

1. Providers send fields named `amount_kobo` or `paid_at`, sometimes `null`, sometimes missing. Your code must tell those apart.
2. A "copy" that still shares a nested object with the original is how a refund can change a record you thought was untouched.
3. Spreading a request body straight into a payment record lets a caller set `status: "succeeded"` themselves. That's a real class of security bug (mass assignment).

**By the end of today I can:**

- Run ESLint on my code and explain what a warning means before fixing it
- Destructure objects and arrays, including nested fields, renaming, and defaults
- Explain why a default (`= "NGN"`) applies to a missing field but **not** to `null`
- Use `= {}` in a parameter so a missing argument gives my own error, not a `TypeError`
- Use rest (`...extra`) to catch input with too many parts
- Make a changed copy with spread, and explain why it's only a **shallow** copy
- Explain why `{ status: "pending", ...input }` is dangerous and what to do instead
- Build an aligned multi-line receipt with a template string, `padEnd` and `padStart`

---

## Week 3 at a glance

| Day | Topic                                                | Build                                       |
| --- | ---------------------------------------------------- | ------------------------------------------- |
| 1   | ESLint, destructuring, spread/rest, template strings | `exercises11.js`                            |
| 2   | Modules: `require`/`module.exports`, then `import`   | Turn `library.js` into a real shared module |
| 3   | Errors properly: `try/catch/finally`, custom errors  | Error handling for bad input and bad data   |
| 4   | `fs` module and JSON (`JSON.parse` failures, saving) | Read and write a JSON file safely           |
| 5   | CLI expense tracker, part 1                          | Add and list expenses, saved to JSON        |
| 6   | CLI expense tracker, part 2, then the Week 3 quiz    | Totals, validation, quiz (5 questions)      |

---

## 1. Learn (60 min)

| Minutes | Topic                                                                 | Read for                                                                               |
| ------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 20      | javascript.info: Destructuring assignment                             | renaming (`{ a: b }`), defaults, nested patterns, "smart function parameters"          |
| 15      | javascript.info: Rest parameters and spread syntax                    | the difference between rest (collects) and spread (expands). Same `...`, opposite jobs |
| 10      | javascript.info: Object references and copying (the part you skipped) | "Cloning and merging", and why a nested object is still shared after a copy            |
| 10      | MDN: Template literals, `String.prototype.padStart` and `padEnd`      | multi-line strings, `${}` with any expression, padding to a fixed width                |
| 5       | ESLint docs: Getting Started                                          | what a "rule" is, and the difference between a warning and an error                    |

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

### Exercise 0: set up ESLint (15 min)

ESLint reads your code **without running it** and warns you about likely bugs: unused variables, `==` instead of `===`, using a variable before it exists. Prettier fixes how code _looks_; ESLint finds code that's probably _wrong_. They don't overlap.

1. Install it (dev dependencies, like Prettier):

   ```bash
   npm install --save-dev eslint @eslint/js globals
   ```

2. Create `eslint.config.mjs` in the project root with this content. Type it yourself and read the comments:

   ```js
   // .mjs means "this file uses import/export". You'll learn that on Day 2.
   import js from "@eslint/js"; // ESLint's recommended rule set
   import globals from "globals"; // tells ESLint that `require`, `process` etc. exist in Node

   export default [
     js.configs.recommended,
     {
       languageOptions: {
         ecmaVersion: "latest",
         sourceType: "commonjs", // your files use require(), not import (yet)
         globals: globals.node,
       },
       rules: {
         eqeqeq: "error", // always === and !==
         "prefer-const": "error", // use const when a variable is never reassigned
         "no-var": "warn", // warn, not error: Day 2 of Week 2 used var on purpose
         "no-unused-vars": "warn",
       },
     },
   ];
   ```

3. Add a script to `package.json`, next to `"format"`:

   ```json
   "lint": "eslint ."
   ```

4. Run `npm run lint`. You'll get warnings in old files. **Don't fix them all.** Pick 3, and for each write down in your notes: the file, the line, the rule name (the last word on the line, like `no-unused-vars`), and in one sentence why that rule exists.
5. Install the VS Code extension **ESLint** (by Microsoft) so warnings show as squiggly lines while you type.

From today: run `npm run lint` before every commit.

### Exercises 1-7 in `exercises11.js`

| #   | Exercise                                                                      | Rough time |
| --- | ----------------------------------------------------------------------------- | ---------- |
| 1   | Warm-up: predict what destructuring gives you                                 | 10         |
| 2   | `parseProviderPayment`: rename and validate a provider's object (**hardest**) | 20         |
| 3   | `createCharge`: destructuring parameters and `= {}`                           | 10         |
| 4   | `parseCsvLine`: array destructuring and rest                                  | 10         |
| 5   | Spread: copies, the shallow-copy trap, `markRefunded`                         | 15         |
| 6   | `formatReceipt`: template strings and padding                                 | 10         |
| 7   | Think (comments only)                                                         | 5          |

That's 95 min with ESLint. If you pass 90 min, leave Exercise 6 for tomorrow's warm-up.

Rules for today:

- **Contract first** for every function (same 4 lines: input, output, empty, bad input).
- **Predict first, then run.** Write the prediction in a comment before you run.
- **A passing `checkThrows` must pass for the right reason.** Read the message. In Exercise 2 and 3 a test can pass because of a `TypeError` instead of your own error; that counts as a fail.
- **Don't edit an expected value** to make a test pass unless you've worked it out by hand.
- **Only use code you can explain.**
- **Time-box rule:** stuck for 20 minutes on one exercise? Ask for a hint. Exercise 2 is the one most likely to need it.
- **Run `npm run lint`** before you commit, and fix anything it reports in `exercises11.js`.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises11.js`".
2. Add a **Week 3, Day 1** entry to `LEARNING.md` with your 3 "still unsure" items and the 3 ESLint rules you looked up.
3. Commit and push:

```bash
npm run lint
git status
git add .
git commit -m "Week 3 Day 1: ESLint, destructuring, spread, template strings"
git push
```

---

## Coming next: Day 2

Modules. You've copied `isValidAmount` into almost every file since Week 1. Tomorrow `library.js` becomes a module that other files load with `require`, so there's one copy of each rule. Then you'll see `import`/`export`, the other module system (the one your `eslint.config.mjs` already uses).
