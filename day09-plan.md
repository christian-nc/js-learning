# Week 2, Day 5 - 24 October 2026

**Theme:** design a small function library. Until now each exercise told you what a function should do. Today you decide the **contract** yourself: what goes in, what comes out, what happens with an empty list, and what happens with bad input. Payment APIs live and die by their contracts. A provider's docs say "amount must be an integer in kobo, minimum 100", and your code has to keep promises that clear too.

You'll write three functions: `average`, `max` and `wordCount`. Each one hides a money or data trap: rounding, empty lists, totals that grow too big, and messy text.

**By the end of today I can:**

- Write a function contract in 4 lines: input, output, empty input, bad input
- Explain why the average of kobo amounts can be a fraction, and choose a rounding rule I can defend
- Say what `Math.max()` with no arguments returns, and why that's a trap
- Explain why a total of valid amounts can still be unsafe (bigger than `Number.MAX_SAFE_INTEGER`)
- Use `Object.keys`, `Object.values` and `Object.entries` to read an object as a list
- Split text into words without counting empty strings, and explain why skipping those is allowed
- Write the self-check from Day 4: the counts in `byStatus` add up to `count`

---

## Week 2 at a glance

| Day | Topic                                         | Build                                             |
| --- | --------------------------------------------- | ------------------------------------------------- |
| 1   | Functions: parameters, `return`, defaults     | Money helper functions, `parseGuess` (done)       |
| 2   | Arrow functions, scope, closures              | Arrow rewrites, closures, shared-state fix (done) |
| 3   | Arrays, `map` and `filter`                    | Prices and transactions lists (done)              |
| 4   | `reduce`, objects, arrays of objects          | Totals and a summary per status (done)            |
| 5   | Function library (average, max, word counter) | Small tested library in `library.js`              |
| 6   | Inventory tracker, then the Week 2 quiz       | Inventory tracker, quiz (5 questions)             |

---

## 1. Learn (60 min)

| Minutes | Topic                                         | Read for                                                                                          |
| ------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 15      | javascript.info: Object.keys, values, entries | what each returns (always an array), and that you can then use `map`/`filter`/`reduce` on it      |
| 15      | javascript.info: Strings                      | `trim`, `toLowerCase`, `split`. Skip the Unicode sections at the end                              |
| 10      | MDN: `String.prototype.split`                 | what `"".split(" ")` and `"a  b".split(" ")` return. Try them in `node` before reading the answer |
| 10      | MDN: `Math.max` and `Math.round`              | the return value of `Math.max()` with no arguments; how `Math.round` handles `.5`                 |
| 10      | MDN: `Number.MAX_SAFE_INTEGER`                | what "safe" means, and what happens to `9007199254740991 + 2`                                     |

Skip spread (`...`) for now. `Math.max(...list)` is Week 3, and today you'll see why you might not want it anyway.

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Work in `library.js`. Each exercise is described there in comments. It has `check`, `checkList` and `checkThrows`. Copy `MAX_KOBO`, `isValidAmount` and `sumReduce` from `exercises08.js` where it says so.

| #   | Exercise                                          | Rough time |
| --- | ------------------------------------------------- | ---------- |
| 1   | Warm-up: predict-then-run traps                   | 10         |
| 2   | Objects as lists: `Object.keys/values/entries`    | 10         |
| 3   | The Day 4 self-check: counts add up to `count`    | 10         |
| 4   | `average`: and the rounding decision              | 20         |
| 5   | `max` and `largestTransaction`, plus a safe total | 20         |
| 6   | `wordCount`                                       | 15         |
| 7   | Contracts and Think (comments only)               | 5          |

Rules for today:

- **Contract first.** Before writing each function, write its 4-line contract in a comment (there's a template in the file). Then write the code to match it.
- **Predict first, then run.**
- **Don't edit an expected value to make a test pass** unless you've worked it out by hand first and written how. (Day 4: the summary test was changed to `succeeded: 4` while the total still counted 3.)
- **Only use code you can explain.** If you find something online (like `?.` or `Set` yesterday), write a one-line comment saying what it does. If you can't, ask me first.
- **Time-box rule:** stuck for 20 minutes on one exercise? Ask for a hint.
- Payment angle: an average or maximum is a number someone will trust in a report. It must be a whole kobo amount, and rounding must be a decision you wrote down, not an accident.

---

## 3. Review (30 min)

1. Ask Claude: "Review `library.js`".
2. Add a **Week 2, Day 5** entry to `LEARNING.md` with your 3 "still unsure" items. (Check the heading says the right day.)
3. Commit and push:

```bash
git status
git add .
git commit -m "Week 2 Day 5: function library"
git push
```

---

## Coming next: Day 6

An inventory tracker (an array of product objects, with stock going in and out) that reuses your library, then the Week 2 quiz: 5 questions on functions, scope, closures, `map`/`filter`/`reduce` and objects.
