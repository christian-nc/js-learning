# Week 2, Day 6 - Inventory tracker and Week 2 quiz

**Theme:** state that changes. Until now most of your functions took a list and returned a new answer. Today the data **changes**: stock goes in and out of a product, and the same object is shared by everything that holds it. That's the same problem as an account balance. A payment system has to answer three questions every time money moves:

1. Is this movement allowed? (enough stock / enough balance)
2. If it fails, is everything left exactly as it was?
3. If one movement in a batch fails, what happens to the ones before it?

You'll build an inventory tracker that answers all three, then finish the week with the quiz.

**By the end of today I can:**

- Trace an object through a change and predict what every variable that points to it shows
- Explain why `find` returning `undefined` is a silent failure, and throw instead
- Write a function that changes state **all-or-nothing**: if it throws, nothing was changed
- Test the state _after_ a failure, not only that the function threw
- Spot a rule from my library (`sumReduce`) that doesn't fit a new situation (zero stock), and decide what to do
- Explain the "validate everything first, then apply" pattern for a batch
- Check a batch result with an independent fact (start + in - out = end)

---

## Week 2 at a glance

| Day | Topic                                         | Build                                             |
| --- | --------------------------------------------- | ------------------------------------------------- |
| 1   | Functions: parameters, `return`, defaults     | Money helper functions, `parseGuess` (done)       |
| 2   | Arrow functions, scope, closures              | Arrow rewrites, closures, shared-state fix (done) |
| 3   | Arrays, `map` and `filter`                    | Prices and transactions lists (done)              |
| 4   | `reduce`, objects, arrays of objects          | Totals and a summary per status (done)            |
| 5   | Function library (average, max, word counter) | Small tested library in `library.js` (done)       |
| 6   | Inventory tracker, then the Week 2 quiz       | `inventory.js`, quiz (5 questions)                |

---

## 1. Learn (60 min)

| Minutes | Topic                                                     | Read for                                                                                           |
| ------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 15      | javascript.info: Object references and copying            | "copied by reference". Stop before `structuredClone` and spread; that's Week 3                     |
| 10      | MDN: `Array.prototype.find` and `findIndex`               | what each returns when nothing matches. That return value is today's trap                          |
| 10      | MDN: `Array.prototype.some` and `every`                   | how they answer "is any / is every item OK?" with a boolean, and stop early                        |
| 10      | Re-read your own `library.js` contracts                   | which rules (`isValidAmount`, `sumReduce`) you'll reuse, and what each one rejects                 |
| 15      | Week 2 revision: your `LEARNING.md` Days 1-5              | the "confused me" items. The quiz will come from this week's topics                                |

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

**First, a 5-minute fix in `library.js` (Exercise 0).** Then work in `inventory.js`. Each exercise is described there in comments.

| #   | Exercise                                                     | Rough time |
| --- | ------------------------------------------------------------ | ---------- |
| 0   | Fix the two leftover tests in `library.js`                   | 5          |
| 1   | Warm-up: trace an object through changes                     | 10         |
| 2   | `findProduct`: never return `undefined` silently             | 10         |
| 3   | `addStock` and `removeStock`: all-or-nothing                 | 20         |
| 4   | `stockValue`: when a library rule doesn't fit                | 15         |
| 5   | `lowStock`: `filter` + `map` report                          | 10         |
| 6   | `applyMovements`: a batch that is all-or-nothing             | 15         |
| 7   | Think (comments only)                                        | 5          |

Rules for today:

- **Contract first.** Same 4-line template as Day 5.
- **Predict first, then run.**
- **After every `checkThrows`, also check the state.** A function that throws _after_ it changed the stock is worse than one that never throws.
- **A passing `checkThrows` must pass for the right reason.** Read the message it prints. (Day 5: a test passed because of `Cannot access 'bigList' before initialization`.)
- **Don't edit an expected value to make a test pass** unless you've worked it out by hand first.
- **Only use code you can explain.**
- **Time-box rule:** stuck for 20 minutes on one exercise? Ask for a hint.
- Payment angle: replace "stock" with "balance" and "product" with "account" in every exercise. The bugs are the same bugs.

---

## 3. Review (30 min)

1. Ask Claude: "Review `inventory.js`".
2. **Week 2 quiz:** ask Claude "Quiz me on Week 2". 5 questions, answered without looking at your code. Put the score in the `Weekly quiz scores` table in `LEARNING.md`, with any topic you missed.
3. Add a **Week 2, Day 6** entry to `LEARNING.md` with your 3 "still unsure" items.
4. Commit and push:

```bash
git status
git add .
git commit -m "Week 2 Day 6: inventory tracker and Week 2 quiz"
git push
```

---

## Coming next: Week 3

Destructuring, spread (`...`), template strings in depth, modules (`import`/`export`, so `library.js` stops being copied into every file), `try/catch` properly, the `fs` module and JSON. Project: a CLI expense tracker that saves to a JSON file. ESLint gets set up at the start of the week.
