# Learning Log

One entry per study day, written in the 30-minute review block. Keep it short and in my own words.
The roadmap is in `claude.md`.

## Entry template

```
## Week N, Day N - date

**Topics:**
**What I built:**
**What I learned (in my own words):**
**What confused me / errors I hit:**
**Questions for next time:**
**Committed to Git:** yes
```

---

## Week 1

### Day 1 — 13 October 2026

- **Topics:** Variables (`let`, `const`), template strings, operators, `if/else`, and `for` loops.
- **What I built:**
  - `day01.js`: prints my name, country, and goal.
  - `exercises01.js`: Celsius-to-Fahrenheit converter, price × quantity with 7.5% tax, adult/minor check, counting from 1–10, even numbers from 1–10, and the same total worked out in kobo.
- **What I learned:** I learned the basics of payment calculations, avoiding decimal errors, `if` statements, and using `let` and `const`. I'm still at the beginning, but I'm excited.
- **What confused me / errors I hit:** I found `if` statements and `for` loops confusing at first, but I'm getting the hang of them.
- **Other note:** `git push -u origin main` failed because the repository had no commits yet.
- **Questions for next time:**
- **Committed to Git:** yes

### Day 2 — 15 October 2026

- **Topics:** JavaScript types and `typeof`, truthy/falsy values, strict equality (`===`), `NaN`, `if/else if` chains, ternary operators, and loops.
- **What I worked on:** `exercises02.js` — practising conditions, a grade checker, a transaction checker, and rewriting/tracing loops.
- **What I learned:** `NaN` is a number type, but comparisons with it are false. I need to check for invalid input before other transaction checks. A non-empty string like `"0"` is truthy. `===` avoids automatic type conversion that can make comparisons confusing.
- **What confused me / errors I hit:** The transaction checker could approve a `NaN` amount because its comparisons were false. I also needed to fix a missing space in loop output, correct loop-tracing comments, and use an empty string (`''`) rather than a space (`' '`). did the corrections, understood and ready for next class.
- **Questions for next time:** None.
- **Committed to Git:** yes

### Day 3 — 16 October 2026

- **Topics** : Random numbers with Math.random() and Math.floor(), terminal input with readline, typeof, converting input with Number(), validating input with Number.isNaN(), checking whole numbers and ranges, while loops, and replay logic.
- **What I worked on:** exercises03.js — printing 10 random numbers from 1–100, asking for my name and age, validating number input, and building a number-guessing game with high/low hints, a 7-attempt limit, and a play-again option.
- **What I learned**: Math.floor(Math.random() * 100) + 1 gives a whole number from 1 to 100. Answers from rl.question() are strings, so I need Number() to convert numeric input. Number("") gives 0, so I should check for empty input separately. Number.isNaN() helps identify invalid numeric input, and I should only count guesses that are whole numbers between 1 and 100.
- **What confused me / errors I hit:** I had to think carefully about empty input and why it should not be accepted as zero. I also worked through the replay loop so a new game starts when the player enters y, including uppercase or lowercase.
- **Questions for next time:** Review the replay logic and make sure the exercises run cleanly from start to finish.
- **Committed to Git:** yes


### Day 4 — 17 October 2026

- **Topics** :  Input validation, Number(), Number.isNaN(), Number.isFinite(), checking positive amounts, and handling empty input.
- **What I worked on:** exercises04.js — practising numeric input validation and checking transaction amounts.
- **What I learned**: I learned that converting input with Number() can turn an empty string or spaces into 0. I need to check for empty input separately and validate the amount before using it.
- **What confused me / errors I hit:** 
1. Why Number.isNaN() alone does not catch empty input after conversion
2. When to use Number.isFinite() versus Number.isNaN().
3. How to make sure an amount is a valid, positive number before approving a transaction.
- **Questions for next time:** None
- **Committed to Git:** yes

---
---

## Weekly quiz scores

| Week | Score (out of 5) | Topics to revisit |
| ---- | ---------------- | ----------------- |
| 1    |           5       |        -           |
