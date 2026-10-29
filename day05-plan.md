# Week 2, Day 1 - 19 October 2026

**Theme:** functions. Until now your code ran top to bottom in one big `main()`. Today you learn to wrap one job in a named, reusable function that takes input and returns a result.

**By the end of today I can:**

- Write a function with parameters and a `return` value, and call it
- Explain the difference between `console.log` inside a function and `return`
- Explain what `undefined` means when a function returns nothing or an argument is missing
- Use a default parameter value
- Turn a piece of my guessing game (input validation) into a function of its own

---

## Week 2 at a glance

| Day | Topic                                         | Build                                          |
| --- | --------------------------------------------- | ---------------------------------------------- |
| 1   | Functions: parameters, `return`, defaults     | Money helper functions, `parseGuess`           |
| 2   | Arrow functions, scope, `const` vs `let`      | Rewrite Day 1 functions, predict scope puzzles |
| 3   | Arrays, `map` and `filter`                    | Work on a list of prices and transactions      |
| 4   | `reduce`, objects, arrays of objects          | Totals and summaries                           |
| 5   | Function library (average, max, word counter) | Small tested library in `library.js`           |
| 6   | Inventory tracker, then the Week 2 quiz       | Inventory tracker, quiz (5 questions)          |

---

## 1. Learn (60 min)

| Minutes | Topic                                                      | Read for                                                                                |
| ------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 25      | javascript.info: Functions                                 | parameters vs arguments, `return`, default values, a function that returns nothing      |
| 15      | MDN: Functions (Guide, "Defining functions" and "Calling") | declaration syntax, what happens when you call a function with too few or too many args |
| 10      | javascript.info: Function expressions (skim only)          | just notice the syntax. Arrow functions come tomorrow                                   |
| 10      | Re-read your own `exercises03.js` guessing-game validation | which lines check the input? Could they live in one function?                           |

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Work in `exercises05.js`. Each exercise is described there in comments. The file has empty function stubs and a small `check` helper that prints PASS or FAIL, so you can test yourself without me.

| #   | Exercise                                                      | Rough time |
| --- | ------------------------------------------------------------- | ---------- |
| 1   | Predict-then-run: missing `return`, missing arguments         | 10         |
| 2   | `greet(name)`: your first function                            | 10         |
| 3   | `isValidAmount(kobo)`                                         | 15         |
| 4   | `calculateTax(kobo, ratePercent = 7.5)`                       | 20         |
| 5   | `formatNaira(kobo)` (display only)                            | 15         |
| 6   | `parseGuess(rawText)`: the guessing-game check, as a function | 15         |
| 7   | Think: why `return` and not `console.log`?                    | 5          |

Rules for today:

- **Predict first, then run.** Write your guess in a comment before you run the code.
- Make the `FAIL` lines turn into `PASS` lines, then add 2 test cases of your own per function.
- Ask Claude for a **hint**, not the answer.
- Payment angle: for every function, ask "what input could break this?" and write the answer in a comment.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises05.js`".
2. Add a Day 1 entry under Week 2 in `LEARNING.md` (template is at the top of that file). Include your 3 "still unsure" items.
3. Commit and push:

```bash
git status
git add .
git commit -m "Week 2 Day 1: functions"
git push
```

---

## Coming next: Day 2

Arrow functions (`const add = (a, b) => a + b`) and scope: which variables a function can see, and why `let` and `const` live inside `{ }` blocks.
