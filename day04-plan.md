# Week 1, Day 4 - 17 October 2026

**Theme:** wrap-up. Nothing new today. You lock in Days 1-3, fix what was shaky, and finish with the Week 1 quiz.

**By the end of today I can:**

- Predict what `"10" < "9"`, `"7" === 7` and `Number("")` give, and explain why
- Explain why `0.1 + 0.2 !== 0.3`, and how kobo (whole numbers) avoids the problem
- Write a `while` loop game from a blank file without copying my old code
- Find and fix bugs by reading the error or tracing values with `console.log`
- Answer the Week 1 quiz (5 questions) without looking anything up

---

## 1. Learn (60 min)

Review day: re-read, don't binge new material.

| Minutes | Topic                                                          | Read for                                                                                       |
| ------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 15      | javascript.info: Comparisons                                   | string comparison is letter by letter, so `"10" < "9"` is `true`; why `===` is safer than `==` |
| 15      | javascript.info: Type Conversions (second pass)                | `Number("")`, `Number(" ")`, `Number("12abc")`, `Number(null)`, `Number(undefined)`            |
| 15      | javascript.info: Numbers, the "Imprecise calculations" section | why `0.1 + 0.2` is `0.30000000000000004`, and `toFixed` / `Math.round`                         |
| 15      | Re-read your own `LEARNING.md` (Days 1-3)                      | anything you wrote that you can no longer explain                                              |

Write down 3 things you are still unsure about. Bring them to the Review block.

---

## 2. Build (90 min)

Work in `exercises04.js`. Each exercise is described there in comments.

| #   | Exercise                                                     | Rough time |
| --- | ------------------------------------------------------------ | ---------- |
| 1   | Predict-then-run: comparing strings and numbers              | 15         |
| 2   | Predict-then-run: what does `Number(...)` do with odd input? | 10         |
| 3   | Money lab: why floats are risky, and the kobo fix            | 15         |
| 4   | Bug hunt: three small broken programs to fix                 | 15         |
| 5   | Guessing game version 1, from a blank page                   | 25         |
| 6   | Think: why is 7 tries enough for 1 to 100?                   | 10         |

Rules for today:

- **Predict first, then run.** Write your guess in a comment before you run the code. Being wrong is the useful part.
- For Exercise 5, do not open `exercises03.js`. Try from memory for 10 minutes first. If you are stuck, ask for a hint.
- Ask Claude for a **hint**, not the answer.

---

## 3. Review (30 min)

1. Ask Claude: "Review `exercises04.js`".
2. Take the **Week 1 quiz** (5 questions, from Claude). Record your score in the `LEARNING.md` quiz table, plus the topics to revisit.
3. Add a Day 4 entry to `LEARNING.md`. Include your 3 "still unsure" items from the Learn block.
4. Commit and push:

```bash
git status
git add .
git commit -m "Day 4: Week 1 wrap-up"
git push
```

---

## Coming next: Week 2

Functions, arrow functions, scope, arrays (`map`, `filter`, `reduce`) and objects. Functions are the first big step toward real payment code: one function to validate an amount, one to calculate a fee, one to format a receipt.
