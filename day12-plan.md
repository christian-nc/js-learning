# Week 3, Day 2 - Modules: `require`/`module.exports`, then `import`/`export`

**Theme:** one copy of each rule. Since Week 1 you've copied `isValidAmount`, `formatNaira` and your `check` helpers into almost every file. Today they move into a `lib/` folder, and every other file loads them from there.

The payment angle:

1. **Two copies of a rule drift apart.** On Week 2 Day 4, `totalSucceeded` and `countByStatus` used different status rules, so the summary disagreed with itself. With one module there's only one rule to get right, and fixing it fixes it everywhere.
2. **A module runs its code once, the first time someone loads it.** A file that prints test output, connects to a database, or calls a provider at the top level does that the moment any other file `require`s it.
3. **What you export, others can change.** If you export the `KNOWN_STATUSES` Set, any file can `.add("hacked")` to it, and your status check now accepts a status you never allowed. Export functions; keep the data private.

**By the end of today I can:**

- Explain what `require("./x")` does: finds the file, runs it top to bottom **once**, and returns its `module.exports`
- Explain why a second `require` of the same file doesn't run it again (the cache), and why both callers get the **same** object
- Write a module that exports only functions and constants, with no test output when it loads
- Explain why `exports = {...}` silently exports nothing, while `module.exports = {...}` works
- Read three module error messages and say the cause of each
- Write the same thing with `export`/`import` in an `.mjs` file, and name three differences from `require`

---

## 1. Learn (60 min)

| Minutes | Topic                                                                                | Read for                                                                                            |
| ------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 20      | Node.js docs: "Modules: CommonJS modules". Read **Caching**, **The `module` object**, **`exports` shortcut** | what `require` returns, why it runs a file only once, why `exports = ...` breaks the link           |
| 20      | javascript.info: "Modules, introduction" and "Export and Import"                     | named vs default exports, `import { a } from "./x.js"`, "a module is evaluated only once"            |
| 10      | MDN: "JavaScript modules" (skim the first half)                                      | why the file extension matters with `import`, and that `import` lines must be at the top             |
| 10      | Node.js docs: "Modules: Packages", the **`"type"`** field only                        | what `"type": "commonjs"` in your `package.json` means, and what `.mjs` / `.cjs` override            |

Two module systems, one job:

| | CommonJS (what you use now) | ES modules (ESM) |
| --- | --- | --- |
| Load | `const { a } = require("./x")` | `import { a } from "./x.mjs"` |
| Share | `module.exports = { a }` | `export const a = ...` |
| When it runs | when the `require` line runs | before any of your code runs |
| File extension | optional (`./x` finds `x.js`) | **required** |
| Your files | `.js` (because `package.json` says `"type": "commonjs"`) | `.mjs` (like `eslint.config.mjs`) |

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

All your module files go in a new folder, `lib/`. Your tests go in `exercises12.js`, which is already written up to the parts you fill in.

| #   | Exercise                                                                          | Rough time |
| --- | --------------------------------------------------------------------------------- | ---------- |
| 1   | What does `require` actually do? (predict, then run)                              | 10         |
| 2   | `lib/testing.js`: move your test helpers, and make `checkThrows` check the reason | 15         |
| 3   | `lib/money.js`: one home for the money rules (**hardest**)                        | 20         |
| 4   | `lib/status.js`: keep the data private, see what happens if you don't            | 15         |
| 5   | Break it on purpose: 3 error messages                                             | 10         |
| 6   | ES modules: the same idea with `import`/`export`, plus an ESLint fix              | 15         |
| 7   | Think (comments only)                                                             | 5          |

Rules for today (same as yesterday):

- **Contract first** for every function you move (the 4 lines: input, output, empty, bad input). You already wrote most of these; move them with the function.
- **Predict first, then run.** Write the prediction in a comment before you run.
- **Move, don't rewrite.** Copy each function exactly as it is in `library.js` / `exercises11.js`. Today is about where code lives, not changing what it does. If a test fails, the bug is probably in the export or the `require`, not the function.
- **A passing `checkThrows` must pass for the right reason.** From Exercise 2 on, your helper checks that for you.
- **Don't edit an expected value** to make a test pass unless you've worked it out by hand.
- **Time-box rule:** stuck for 20 minutes? Ask for a hint. Exercise 3 is the one most likely to need it.
- **Run `npm run lint`** before you commit.

Run the file after each exercise: `node exercises12.js`. Sections you haven't reached yet will crash with something like `ReferenceError: isValidAmount is not a function` or `... is not defined`. That's expected. Read which name it complains about; it tells you which exercise you're up to.

---

### Exercise 1: What does `require` actually do? (10 min)

`library.js` has your functions **and** about 40 lines of `console.log` and tests at the top level. It also has no `module.exports` line.

1. Create a file `try-require.js` with exactly these lines:

   ```js
   const lib = require("./library");
   console.log("--- after first require ---");
   const lib2 = require("./library");
   console.log("--- after second require ---");
   console.log(Object.keys(lib));
   console.log(lib === lib2);
   ```

2. **Before you run it**, answer in a comment at the top of `try-require.js`:
   - a) Does anything print before `--- after first require ---`? What?
   - b) Does anything print between the first and second marker lines?
   - c) What does `Object.keys(lib)` print?
   - d) What does `lib === lib2` print?
3. Run `node try-require.js`. Write what actually happened under each prediction.

Expected, so you can check yourself after running: (a) yes, all of `library.js`'s output; (b) nothing; (c) `[]`; (d) `true`. If you got any of these wrong, write one sentence on why. The Node docs section "Caching" explains (b) and (d).

Lesson: a file meant to be `require`d must not print or test anything at the top level, and it must say what it shares with `module.exports`. That's why tests go in a separate file from today on.

---

### Exercise 2: `lib/testing.js` (15 min)

1. Create `lib/testing.js`. Copy `check`, `checkList` and `checkThrows` from `exercises11.js` (not from `library.js`, which has an older `checkThrows`).
2. Export all three with one `module.exports = { ... }` line at the bottom of the file.
3. Upgrade `checkThrows` to take an optional third argument, `expectedText`:

   ```js
   checkThrows(testName, fn, expectedText)
   ```

   - If `fn` doesn't throw: FAIL, return `false` (same as now).
   - If it throws and `expectedText` was **not** given: PASS, return `true` (same as now, so old calls still work).
   - If it throws and the error message **includes** `expectedText`: PASS, return `true`.
   - If it throws but the message does **not** include `expectedText`: print `FAIL - <testName> (threw for the wrong reason: "<message>", expected text: "<expectedText>")` and return `false`.

   Hint: strings have an `.includes()` method.

   This is the fix for the Day 5 bug, where `checkThrows` passed on `Cannot access 'bigList' before initialization`. With `expectedText`, that test would have failed.

4. In `exercises12.js`, write the `require` line for `lib/testing.js` where the TODO says, then run. Section 2 has 4 tests for the helper itself. One of them deliberately throws for the wrong reason, so you'll see one `FAIL` line printed **by the helper**, followed by a `PASS` line confirming the helper returned `false`. That pair is correct.

---

### Exercise 3: `lib/money.js` (20 min, hardest)

1. Create `lib/money.js` with `MAX_KOBO`, `isValidAmount`, `formatNaira` and `sumReduce`. Copy `isValidAmount` and `sumReduce` from `library.js`, `formatNaira` from `exercises11.js`. Keep their contracts as comments above them.
2. **Nothing else.** No `check` calls, no `console.log`. Exercise 1 showed you why.
3. Export the four of them.
4. Write the `require` line in `exercises12.js` (Section 3 TODO) and run.

Expected results are all in Section 3 of `exercises12.js`. One test checks exactly which names `money.js` exports: `["MAX_KOBO", "formatNaira", "isValidAmount", "sumReduce"]`. If that fails, compare spelling first.

Two things that often go wrong here:

- `sumReduce` uses `isValidAmount`, so both must be in the same file (or `sumReduce`'s file must `require` the other). Why? Each module has its own scope. Code in `money.js` can't see variables in `exercises12.js` and the other way round. The only door between them is `module.exports` → `require`.
- If a test says `isValidAmount is not a function`, check: did you export it? Did you spell it the same in the `require` line?

---

### Exercise 4: `lib/status.js` and private data (15 min)

1. Create `lib/status.js` with `KNOWN_STATUSES` and `normalizeStatus` (from `library.js`). **Export only `normalizeStatus`.**
2. Write the `require` line in `exercises12.js` (Section 4 TODO) and run. Section 4a should pass.
3. Section 4b: the shared-data trap. Do it in this order:
   - a) In `lib/status.js`, temporarily add `KNOWN_STATUSES` to `module.exports`.
   - b) In `exercises12.js`, uncomment the Section 4b block. **Predict** the two printed results in a comment, then run.
   - c) Write one sentence: why did `normalizeStatus` accept `"hacked"` even though the code in `status.js` never changed?
   - d) Remove `KNOWN_STATUSES` from `module.exports` again. Run. **Predict** the error first. Then comment the 4b block back out.

Expected: in (b), `normalizeStatus("hacked")` returns `"hacked"`, and the second `require` sees it too (same object, Exercise 1). In (d), `TypeError: Cannot read properties of undefined (reading 'add')`, because `KNOWN_STATUSES` is no longer exported, so `status.KNOWN_STATUSES` is `undefined`.

Real-world version: if a payment library exported its list of allowed currencies or allowed state changes as a plain array or Set, any file (or any npm package you installed) could quietly add to it.

---

### Exercise 5: Break it on purpose (10 min)

Do each one, run `node exercises12.js`, copy the **first line of the error** into the Section 5 comments in `exercises12.js`, write the cause in one sentence, then undo the change before the next one.

| # | Change | Where |
| --- | --- | --- |
| a | Remove the `./` so it reads `require("lib/money")` | `exercises12.js` |
| b | Misspell one name in your `require` line: `isValidAmout` | `exercises12.js` |
| c | Replace `module.exports = { ... }` with `exports = { ... }` | `lib/money.js` |

Expected first lines: (a) `Error: Cannot find module 'lib/money'`; (b) `ReferenceError: isValidAmount is not defined` or `TypeError: isValidAmout is not a function`, depending on where it's first used; (c) no error from `require` at all, but your tests then fail with `... is not a function`, because `money.js` exported an empty object.

For (b), also run `npm run lint`. Does ESLint catch the misspelling? Write yes or no and why you think so. (Hint: ESLint reads one file at a time.)

(c) is the worst of the three: nothing crashes where the mistake is. That's the "silent wrong result" pattern from your Needs-more-practice list.

---

### Exercise 6: ES modules (15 min)

1. Create a folder `esm/` with two files:
   - `esm/money.mjs`: put `MAX_KOBO` and `isValidAmount` here, each with `export` in front (`export const MAX_KOBO = ...`). Add a first-line comment: `// Learning copy for the ESM exercise. The real one is lib/money.js.`
   - `esm/main.mjs`: `import` both from `"./money.mjs"` and print `isValidAmount(5000)` and `isValidAmount(MAX_KOBO + 1)`. Expected: `true`, `false`.
2. Run `node esm/main.mjs`. Then try each of these, **predict first**, write the first line of the error in a comment in `main.mjs`, and undo:
   - a) Import from `"./money"` (no `.mjs`).
   - b) Add `const fs = require("fs");` to `main.mjs`.
   - c) Add `console.log(isValidAmount == true);` to `main.mjs`. Don't run it; run `npm run lint` instead.

   Expected: (a) `Error [ERR_MODULE_NOT_FOUND]: Cannot find module ...`; (b) `ReferenceError: require is not defined in ES module scope`; (c) ESLint reports `'console' is not defined` and does **not** complain about the `==`.

3. Why (c)? Your `eslint.config.mjs` block now says `files: ["**/*.js"]`, so your rules and Node globals only apply to `.js` files. `.mjs` files get none of them. Fix it: add a **second** object to the config array for `files: ["**/*.mjs"]`, with `sourceType: "module"`, `globals: globals.node`, and the same `rules`. Run `npm run lint` again. Now you should see `eqeqeq` fire on the `==`. Then remove the test line.

We stay with CommonJS (`require`) for the rest of Phase 1, because that's what your `package.json` is set to and what most Node tutorials use. You'll meet ESM again in Express and TypeScript projects. Pick one system per project; don't mix them.

---

### Exercise 7: Think (5 min, comments only, in `exercises12.js` Section 7)

1. Week 2 Day 4: your summary disagreed with itself because two functions had their own status rules. How does `lib/status.js` stop that from happening again? What could still go wrong? (Think about someone who doesn't use the module.)
2. Why is exporting `normalizeStatus` safe, but exporting `KNOWN_STATUSES` is not?
3. Imagine `lib/money.js` had `chargeCard(testCard, 5000)` at the top level. What happens each time a new file `require`s it? What about the second file?
4. Name three differences between `require` and `import` that you saw today (not ones you only read about).

---

## 3. Review (30 min)

1. Ask Claude: "Review `lib/` and `exercises12.js`".
2. Add a **Week 3, Day 2** entry to `LEARNING.md` with your 3 "still unsure" items and the 3 error messages from Exercise 5.
3. Delete `try-require.js` (it was a one-off experiment), or keep it with your comments. Your choice; say which in the log.
4. Commit and push. Your uncommitted `files: ["**/*.js"]` change to `eslint.config.mjs` from yesterday goes in this commit too, with today's `.mjs` block.

```bash
npm run lint
git status
git add .
git commit -m "feat: Week 3 Day 2 - modules, lib/ folder, ESM basics"
git push
```

---

## Coming next: Day 3

Errors properly. You've been writing `throw new Error("...")` and `checkThrows` for two weeks. Tomorrow: `try/catch/finally` in your own code (not only inside the test helper), custom error types like `ValidationError`, and the difference between "the input was bad" and "something broke", which decides whether a payment API returns a 400 or a 500.
