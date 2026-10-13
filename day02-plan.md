# Week 1, Day 2 - 14 October 2026

**Theme:** decisions and repetition. Yesterday `if` and `for` felt shaky, so today is about making them solid before adding anything big.

**By the end of today I can:**
- Say what type a value is (`string`, `number`, `boolean`, `undefined`, `null`) and check it with `typeof`
- Explain why `===` is used instead of `==`
- Combine conditions with `&&`, `||`, `!`
- Write an `if / else if / else` chain and predict which branch runs
- Trace a `for` loop by hand, and write the same loop as a `while` loop
- Solve FizzBuzz without help

---

## 1. Learn (60 min)

Read these on javascript.info (The JavaScript language > JavaScript Fundamentals):

| Minutes | Chapter | Read for |
|---------|---------|----------|
| 10 | Data types | the 5 types above, `typeof` |
| 10 | Comparisons | `===` vs `==`, comparing a string to a number |
| 10 | Conditional branching: if, '?' | `else if`, truthy and falsy values |
| 10 | Logical operators | `&&`, `||`, `!` |
| 20 | Loops: while and for | the 3 parts of a `for` loop, `while`, `break`, `continue` |

Type the examples into a scratch file and run them with `node`. Don't only read.

**How to read a `for` loop** (the part that confused me yesterday):

```js
for (let i = 1; i <= 3; i++) {
    console.log(i);
}
```

1. `let i = 1` runs **once**, at the start.
2. `i <= 3` is checked **before every round**. If it is false, the loop ends.
3. The body `{ ... }` runs.
4. `i++` runs **after** the body, then go back to step 2.

An `if` is not a loop. It checks its condition once and runs its block zero or one time. A loop goes back and checks again.

---

## 2. Build (90 min)

Work in `exercises02.js`. Each exercise is described there in comments. Write the code under each comment, run `node exercises02.js` often, and fix one error at a time.

| # | Exercise | Rough time |
|---|----------|-----------|
| 1 | Type detective: predict, then check with `typeof` | 10 |
| 2 | Loop tracing on paper, then confirm | 10 |
| 3 | Grade calculator (`else if` chain) | 15 |
| 4 | Transaction check (`&&`, `||`) | 15 |
| 5 | Sum of 1 to 100 (`for`, then `while`) | 10 |
| 6 | Multiplication table | 10 |
| 7 | **FizzBuzz** | 20 |

Rules for today:
- Try for at least 10 minutes before asking for a hint.
- Ask Claude for a **hint**, not the answer.
- If an error appears, read the message and the line number first, then ask.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises02.js`" (bugs, habits, edge cases).
2. Answer these out loud or in writing, without looking:
   - What does `typeof "42"` give, and why does that matter for a payment amount?
   - What is the difference between `=`, `==`, and `===`?
   - In a `for` loop, which part runs only once?
   - In FizzBuzz, why does the order of the checks matter?
   - When would I choose `while` over `for`?
3. Add a Day 2 entry to `LEARNING.md`.
4. Commit and push:

```bash
git add .
git commit -m "Day 2: types, comparisons, else-if, while loops, FizzBuzz"
git push
```

---

## Coming on Day 3

Number-guessing game: `Math.random()`, reading keyboard input in Node, and a `while` loop that runs until the guess is right.
