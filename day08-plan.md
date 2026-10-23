# Week 2, Day 4 - 23 October 2026

**Theme:** `reduce` and objects. Yesterday you transformed lists (`map`) and selected from them (`filter`). Today you **collapse** a list into one answer: the day's total, the number of failed payments, a summary per status. Almost every report a payment team reads (settlement totals, reconciliation, dashboards) is a `reduce` over a list of objects. Because totals are money, a silent mistake here gives you a wrong number that still looks believable.

**By the end of today I can:**

- Create an object, read fields with a dot and with brackets, and add or update a field
- Say what you get when you read a field that doesn't exist, and why `undefined + 1` is a trap
- Explain why two objects with the same contents are not `===` (same idea as arrays)
- Rewrite a summing `for` loop as `reduce`, and say what the accumulator and the initial value are
- Explain why `reduce` on an empty list needs an initial value
- Chain `filter` then `reduce` to total the successful transactions
- Use `reduce` to build an object (a count per status)
- Spot three classic `reduce` bugs: no `return`, no initial value, and string amounts

---

## Week 2 at a glance

| Day | Topic                                         | Build                                             |
| --- | --------------------------------------------- | ------------------------------------------------- |
| 1   | Functions: parameters, `return`, defaults     | Money helper functions, `parseGuess` (done)       |
| 2   | Arrow functions, scope, closures              | Arrow rewrites, closures, shared-state fix (done) |
| 3   | Arrays, `map` and `filter`                    | Prices and transactions lists (done)              |
| 4   | `reduce`, objects, arrays of objects          | Totals and a summary per status                   |
| 5   | Function library (average, max, word counter) | Small tested library in `library.js`              |
| 6   | Inventory tracker, then the Week 2 quiz       | Inventory tracker, quiz (5 questions)             |

---

## 1. Learn (60 min)

| Minutes | Topic                                                       | Read for                                                                                            |
| ------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 20      | javascript.info: Objects                                    | creating objects, dot vs square brackets, computed keys, the `in` operator, `for...in`              |
| 10      | javascript.info: Object references and copying (first part) | "copied by reference" and "comparison by reference" only. Stop before "Cloning and merging"         |
| 20      | javascript.info: Array methods, the `reduce` section only   | what the callback receives (`accumulator`, `item`), what it must return, the initial value          |
| 10      | MDN: `Array.prototype.reduce`                               | the "Return value" and "Exceptions" sections. What happens on an empty array with no initial value? |

Skip `Object.assign`, spread (`...`) and `structuredClone` for now. Spread is Week 3.

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Work in `exercises08.js`. Each exercise is described there in comments. It has `check`, `checkList`, and your own `checkThrows` from Day 2.

| #   | Exercise                                                | Rough time |
| --- | ------------------------------------------------------- | ---------- |
| 1   | Warm-up: two silent results from Day 3                  | 10         |
| 2   | Predict-then-run: object basics                         | 10         |
| 3   | Sum a list of amounts: `for` loop first, then `reduce`  | 15         |
| 4   | Total the successful transactions (`filter` + `reduce`) | 10         |
| 5   | Count per status: `reduce` into an object               | 15         |
| 6   | Find and fix: three `reduce` bugs                       | 15         |
| 7   | Build a daily summary object                            | 10         |
| 8   | Think (comments only)                                   | 5          |

Rules for today:

- **Predict first, then run.** Write your guess in a comment before you run the code.
- Make the `FAIL` lines turn into `PASS` lines, then add your own test cases.
- Ask Claude for a **hint**, not the answer.
- **Time-box rule:** if you are stuck on one exercise for 20 minutes, stop and ask for a hint. If the 90 minutes run out, stop and bring what's left to the Review block.
- **Silent-result rule (new today):** for every function, write one comment saying what it does with bad input. It should either throw, or return the bad items so they can be reported. "Skips them quietly" is not allowed unless you write why.
- Payment angle: a total is only trustworthy if every item in it was a valid kobo amount. Validate before you add.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises08.js`".
2. Add a Day 4 entry under Week 2 in `LEARNING.md`. Include your 3 "still unsure" items.
3. Commit and push:

```bash
git status
git add .
git commit -m "Week 2 Day 4: reduce and objects"
git push
```

---

## Coming next: Day 5

A small function library in `library.js`: `average`, `max`, and a word counter (which is a `reduce` into an object, so today's Exercise 5 is practice for it). Every function gets tests and a decision about empty and bad input.
