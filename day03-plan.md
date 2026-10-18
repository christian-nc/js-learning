# Week 1, Day 3 - 16 October 2026

**Theme:** putting it together. Today you use `while`, `if / else if`, and comparisons to build your first real program: a number-guessing game.

**By the end of today I can:**

- Generate a random whole number in a range with `Math.random()` and `Math.floor()`
- Convert keyboard input (always a string) to a number and detect bad input with `Number()` and `Number.isNaN()`
- Read input from the keyboard in Node with `readline`
- Write a `while` loop that runs until a condition is met, and stop it with `break`
- Explain what a counter variable is and why a game needs a maximum number of tries

---

## 1. Learn (60 min)

| Minutes | Topic                                                        | Read for                                                     |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 15      | javascript.info: Type Conversions                            | `Number("abc")`, `Number("")`, `Number("42")`, what `NaN` is |
| 10      | javascript.info: Numbers (Math section only)                 | `Math.random()`, `Math.floor()`, `Math.round()`              |
| 15      | Node docs: `readline` (the `readline/promises` example)      | how to ask a question and get the answer                     |
| 10      | javascript.info: Loops, revisit `while`, `break`, `continue` | stopping a loop early                                        |
| 10      | Review your Day 2 `NaN` bug                                  | why a `NaN` slipped through your transaction checker         |

Type every example into a scratch file and run it with `node`.

**Two things to know before you start:**

1. Input from the keyboard is **always a string**. `"7" === 7` is `false`. You must convert it, and check that the conversion worked. This is the same lesson as `typeof "42"` yesterday, and the same one that applies to a payment amount arriving from a form.
2. `await` only works inside an `async` function, or at the top level of an ES module. Don't worry about the details yet; Week 4 covers async properly. Today, copy the pattern from the Node docs example and focus on the game logic.

---

## 2. Build (90 min)

Work in `exercises03.js`. Each exercise is described there in comments.

| #   | Exercise                                                               | Rough time |
| --- | ---------------------------------------------------------------------- | ---------- |
| 1   | Random number lab: print 10 random whole numbers from 1 to 100         | 10         |
| 2   | Input lab: ask the user a question, show what you got and its `typeof` | 15         |
| 3   | Input validation: turn text into a number and reject bad input         | 15         |
| 4   | **Number-guessing game**, version 1 (loop until correct)               | 30         |
| 5   | Version 2: too high / too low hints, and a maximum of 7 tries          | 15         |
| 6   | Stretch: play again?                                                   | 5          |

Rules for today:

- Try for at least 10 minutes before asking for a hint.
- Ask Claude for a **hint**, not the answer.
- Before you run the game, write on paper what should happen if the user types `abc`, an empty line, `-5`, `3.5`, and `500`.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises03.js`".
2. Answer these without looking:
   - Why does the number from `readline` need converting before you compare it?
   - What does `Number("abc")` give, and how do you check for it?
   - What is the difference between `break` and `continue`?
   - Why should the game have a maximum number of tries?
   - Why does `Math.floor(Math.random() * 100)` never give 100, and how do you get 1 to 100?
3. Add a Day 3 entry to `LEARNING.md`.
4. Commit and push:

```bash
git add .
git commit -m "Day 3: readline input, validation, number-guessing game"
git push
```

---

## Coming on Day 4

Week 1 wrap-up: tidy and fix the guessing game, revisit anything shaky from Days 1-3, then the Week 1 quiz (5 questions). Functions start in Week 2.
