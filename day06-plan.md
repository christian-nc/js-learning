# Week 2, Day 2 - 20 October 2026

**Theme:** arrow functions and scope. Yesterday you wrote functions with the `function` keyword. Today you learn a shorter syntax, and the rules for which variables a function can see. Scope bugs are quiet: the code runs, but a value is wrong or shared when it should not be.

**By the end of today I can:**

- Write the same function as a declaration, a function expression, and an arrow function
- Use the short arrow form (implicit return) and know when it needs `( )` or `{ }`
- Explain global, function and block scope, and which variables a function can see
- Explain why `let` and `const` stay inside `{ }` and what `var` does differently
- Predict what a closure remembers (a function that "keeps" a variable from outside)
- Fix a scope bug and say why it was dangerous

---

## Week 2 at a glance

| Day | Topic                                         | Build                                          |
| --- | --------------------------------------------- | ---------------------------------------------- |
| 1   | Functions: parameters, `return`, defaults     | Money helper functions, `parseGuess` (done)    |
| 2   | Arrow functions, scope, `const` vs `let`      | Rewrite Day 1 functions, predict scope puzzles |
| 3   | Arrays, `map` and `filter`                    | Work on a list of prices and transactions      |
| 4   | `reduce`, objects, arrays of objects          | Totals and summaries                           |
| 5   | Function library (average, max, word counter) | Small tested library in `library.js`           |
| 6   | Inventory tracker, then the Week 2 quiz       | Inventory tracker, quiz (5 questions)          |

---

## 1. Learn (60 min)

| Minutes | Topic                                        | Read for                                                                                |
| ------- | -------------------------------------------- | --------------------------------------------------------------------------------------- |
| 20      | javascript.info: Arrow functions, the basics | `=>` syntax, one-line form with implicit return, multi-line form that needs `return`    |
| 20      | javascript.info: Variable scope, closure     | outer variables, block scope, what a function remembers from where it was created       |
| 10      | MDN: `let`, `const` and "Scope" (Glossary)   | block scope, the temporal dead zone, why `const` still lets an object's contents change |
| 10      | Re-read your `exercises05.js`                | which functions would be a clean one-liner as an arrow? Which would not?                |

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Work in `exercises06.js`. Each exercise is described there in comments. It has the same `check` helper as yesterday.

| #   | Exercise                                                     | Rough time |
| --- | ------------------------------------------------------------ | ---------- |
| 1   | Predict-then-run: scope puzzles (block, function, shadowing) | 15         |
| 2   | Same function, three syntaxes                                | 10         |
| 3   | Rewrite `calculateTax` and `formatNaira` as arrows           | 20         |
| 4   | Small arrow helpers (`toKobo`, `toNaira`, `isEven`)          | 10         |
| 5   | A closure: `makeCounter` and `makeTaxCalculator(rate)`       | 20         |
| 6   | Find and fix the shared-state bug                            | 10         |
| 7   | Think: why is a shared global dangerous in payment code?     | 5          |

Rules for today:

- **Predict first, then run.** Write your guess in a comment before you run the code.
- Make the `FAIL` lines turn into `PASS` lines, then add your own test cases.
- Ask Claude for a **hint**, not the answer.
- Payment angle: for every function, ask "what input could break this?" and write the answer in a comment.
- Carry over from Day 1: remove duplicated rules (for example "zero is allowed") into one small function, and write a comment for each design decision.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises06.js`".
2. Add a Day 2 entry under Week 2 in `LEARNING.md`. Include your 3 "still unsure" items.
3. Commit and push:

```bash
git status
git add .
git commit -m "Week 2 Day 2: arrow functions and scope"
git push
```

---

## Coming next: Day 3

Arrays: creating them, indexing, `push`, `length`, and the two workhorses `map` and `filter`, applied to a list of prices and transactions.
