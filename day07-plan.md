# Week 2, Day 3 - 21 October 2026

**Theme:** arrays, `map` and `filter`. Until now you have handled one amount at a time. Real payment work is lists: today's transactions, a cart of prices, a batch of payouts. `map` and `filter` let you transform or select from a list without changing the original, and that matters when the original is the record of what happened.

**By the end of today I can:**

- Create an array, read items by index, and use `length` and `push`
- Explain why `[1, 2] === [1, 2]` is `false` (arrays are compared by reference)
- Rewrite a `for` loop as `map`, and say what `map` returns
- Use `filter` with a callback that returns `true` or `false`
- Chain `filter` then `map` to answer a question about a list
- Spot the two classic `map` bugs: forgetting `return`, and changing the original array
- Explain why silently dropping bad payment data is dangerous

---

## Week 2 at a glance

| Day | Topic                                         | Build                                             |
| --- | --------------------------------------------- | ------------------------------------------------- |
| 1   | Functions: parameters, `return`, defaults     | Money helper functions, `parseGuess` (done)       |
| 2   | Arrow functions, scope, closures              | Arrow rewrites, closures, shared-state fix (done) |
| 3   | Arrays, `map` and `filter`                    | Work on a list of prices and transactions         |
| 4   | `reduce`, objects, arrays of objects          | Totals and summaries                              |
| 5   | Function library (average, max, word counter) | Small tested library in `library.js`              |
| 6   | Inventory tracker, then the Week 2 quiz       | Inventory tracker, quiz (5 questions)             |

---

## 1. Learn (60 min)

| Minutes | Topic                                                   | Read for                                                                                 |
| ------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 20      | javascript.info: Arrays                                 | creating arrays, index from 0, `length`, `push`/`pop`, `for...of`, comparing arrays      |
| 25      | javascript.info: Array methods (`map`, `filter` only)   | what each callback receives, what each method returns, which methods change the original |
| 10      | MDN: `Array.prototype.map` and `Array.prototype.filter` | read the "Return value" section of each, and the first two examples                      |
| 5       | Re-read your Day 2 "still unsure" list in `LEARNING.md` | Exercise 1 tests the closure one. Write a guess for it before you start                  |

Skip `reduce`, `find`, `sort` and `forEach` for now. `reduce` is tomorrow.

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Work in `exercises07.js`. Each exercise is described there in comments. It has `check` plus a new `checkList` helper for comparing arrays (Exercise 2 explains why `check` can't do that).

| #   | Exercise                                                  | Rough time |
| --- | --------------------------------------------------------- | ---------- |
| 1   | Warm-up: closure and scope tracing (Day 2 follow-up)      | 10         |
| 2   | Predict-then-run: array basics and comparing arrays       | 10         |
| 3   | Add VAT to a list of prices: `for` loop first, then `map` | 15         |
| 4   | `filter` and `map` on a list of transactions              | 15         |
| 5   | Chaining: answer two questions in one expression each     | 10         |
| 6   | Find and fix: two `map` bugs                              | 15         |
| 7   | Clean a messy list of amounts, and don't lose the rejects | 10         |
| 8   | Think (comments only)                                     | 5          |

Rules for today:

- **Predict first, then run.** Write your guess in a comment before you run the code.
- Make the `FAIL` lines turn into `PASS` lines, then add your own test cases.
- Ask Claude for a **hint**, not the answer.
- **Time-box rule:** if you are stuck on one exercise for 20 minutes, stop and ask for a hint. If the 90 minutes run out, stop and bring what's left to the Review block. Don't go past 3 hours again today.
- Payment angle: for every function, ask "what input could break this?" and write the answer in a comment.
- Carry over from Day 2: one rule lives in one place (the tax-rate rule in Exercise 3).

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises07.js`".
2. Add a Day 3 entry under Week 2 in `LEARNING.md`. Include your 3 "still unsure" items.
3. Commit and push:

```bash
git status
git add .
git commit -m "Week 2 Day 3: arrays, map and filter"
git push
```

---

## Coming next: Day 4

`reduce` (turning a list into one value, such as a total), objects in more depth, and arrays of objects. You'll total the successful transactions from today and build a summary per status.
