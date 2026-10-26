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

- **Topics** : Input validation, Number(), Number.isNaN(), Number.isFinite(), checking positive amounts, and handling empty input.
- **What I worked on:** exercises04.js — practising numeric input validation and checking transaction amounts.
- **What I learned**: I learned that converting input with Number() can turn an empty string or spaces into 0. I need to check for empty input separately and validate the amount before using it.
- **What confused me / errors I hit:**

1. Why Number.isNaN() alone does not catch empty input after conversion
2. When to use Number.isFinite() versus Number.isNaN().
3. How to make sure an amount is a valid, positive number before approving a transaction.

- **Questions for next time:** None
- **Committed to Git:** yes

---

## Week 2

### Day 1 — 19 October 2026

- **Topics** : Functions, parameters, return, default parameters, input validation, regular expressions, money limits, and formatting Naira amounts.
- **What I worked on:** functions to add and return values, greet a user, validate kobo amounts, calculate tax, format Naira, and parse a guessing-game input.
- **What I learned**: A function without return gives back undefined. Returning a value lets the rest of the program reuse it and makes testing easier. Number.isSafeInteger() does not enforce my own maximum amount, so I also need the MAX_KOBO limit. I should reject an invalid tax rate such as Infinity, and use trim() before checking the input text so spaces around a valid guess can be accepted without allowing formats like 1e1 or 0x1F.
- **What confused me / errors I hit:**

1. trim() order: I needed to trim the input before checking it against the digits-only pattern. That lets " 42 " work while rejecting unwanted numeric formats.
2. Infinity tax rate: Checking only that the rate is not negative is not enough; Infinity must also be rejected with Number.isFinite().
3. Maximum amount: A positive safe integer can still be above my business limit, so isValidAmount() must check that the amount is no greater than MAX_KOBO.

- **Questions for next time:** None
- **Committed to Git:** yes

### Day 2 — 20 October 2026

- **Topics** : Variable scope, shadowing, let vs var, function declarations vs function expressions and arrow functions, closures, and keeping customer totals separate.
- **What I worked on:** exercises06.js — comparing function syntaxes, rewriting amount/tax/formatting functions as arrows, writing small arrow helpers, creating counters and tax calculators with closures, and fixing shared customer totals.
- **What I learned**: A variable declared inside a function or block is not always available outside it. A closure lets a returned function remember variables from the function that created it. Each call to makeTotal() creates its own private total, so customers do not share state.
- **What confused me / errors I hit:**

1. Scope and shadowing: I want to get more confident about which rate is used and why let and var behave differently inside a block.
2. Function syntax and hoisting: I want to remember why a function declaration can be called before its definition, but a const function expression or arrow function cannot be used the same way.
3. Closures: I want more practice understanding exactly how makeTaxCalculator() remembers its rate and how each makeTotal() call keeps a separate total.

- **Questions for next time:** Practise tracing scope and closures step by step, and review the remaining tests for the arrow-function exercises.
- **Committed to Git:** yes

---

### Day 3 — 21 October 2026

- **Topics** : Arrays, array indexes and .length, array references, map(), filter(), chaining array methods, and tracing closures and scope.
- **What I worked on:** exercises07.js — tracing closure behavior, reading and updating arrays, adding VAT with a loop and with map(), filtering transactions, chaining filter() and map(), and fixing array-transformation bugs.
- **What I learned**: map() creates a new array by transforming each item, while filter() creates a new array containing only items that pass a condition. push() returns the new length, not the array. Two array literals with the same contents are still different arrays, but two variables can refer to the same array. A closure can use the current value of a variable it closes over, and let inside a loop is block-scoped.
- **What confused me / errors I hit:**

1. Silent wrong results vs errors: I want to get better at spotting when code returns a plausible but incorrect result instead of throwing an error.
2. map() vs filter(): I want more practice choosing whether to transform every item or keep only items that match a condition, and understanding why the order matters when chaining them.
3. Array references and closures: I want to practise tracing when variables refer to the same array and when a closure reads a variable that changes later.

- **Questions for next time:** Practise tracing map() and filter() step by step, and check that invalid payment data fails clearly rather than producing a misleading result.
- **Committed to Git:** yes

---

### Day 4 — 23 October 2026

- **Topics** : reduce(), objects and property access, array validation, converting CSV strings with map(Number), payment statuses, and building a daily summary.
- **What I worked on:** xercises08.js — summing amounts with a loop and reduce(), totaling successful payments, counting transactions by status, fixing reduce bugs, converting CSV values, and creating summarizeDay().
- **What I learned**: reduce() needs to return the updated accumulator each time. A function can give a wrong result without throwing an error, so I need tests that check the relationship between results, not just whether each function passes its own test. CSV values arrive as strings, so converting them with map(Number) is part of the path I need to test. The successful-payment total and status count must use the same rule for recognizing statuses. payment.field looks for the literal key "field", while payment[field] uses the value stored in the field variable.
- **What confused me / errors I hit:**

1. Silent wrong results vs errors: I need to check for plausible but incorrect results, not only thrown errors.
2. Tracing object references: I need more practice following an object's property after it is changed.
3. CSV conversion and validation: I need to remember that Number("") gives 0, and that conversion alone does not mean an amount is valid. I also found optional chaining (?.) and Set.has() unfamiliar; I have not reached those topics yet and should revisit them later.

- **Questions for next time:** Practise tracing object properties and bracket notation, and review how to test that the daily summary agrees with the individual payment functions.
- **Committed to Git:** yes

---

### Day 5 — 26 October 2026

- **Topics** : Function contracts, empty-input behavior, reduce(), object counting, safe-integer totals, array filtering, and testing that functions throw for the right reason.
- **What I worked on:** library.js — writing average(), max(), largestTransaction(), and wordCount(); checking status totals with countsMatchTotal(); and testing empty lists, invalid values, ties, and large totals.
- **What I learned**: A contract should say what a function accepts, returns, and does with empty or invalid input. average([]) and max([]) should throw instead of returning a misleading value, while wordCount("") can return {} because an empty string simply contains no words. sumReduce() must check the running total as well as each amount, because individually valid amounts can add up to a number JavaScript cannot safely represent. largestTransaction() should filter to successful payments, use max() to find the amount, and return the first transaction when there is a tie. wordCount() uses reduce() to build an object, lowercases words, and ignores empty pieces caused by extra spaces; punctuation is still attached to words for now.
- **What confused me / errors I hit:**

1. False-positive throw tests: checkThrows(testName, fn) expects the label first and the function second. Reversing the arguments caused a test to pass because it threw fn is not a function, not because the function under test behaved correctly. A big-list test also needs to run only after bigList has been declared; otherwise, a reference error can make the test pass for the wrong reason.
2. Empty input contracts: I need to keep distinguishing functions where empty input is invalid (average() and max()) from a function where empty input is a valid, meaningful result (wordCount()).
3. wordCount("paid, paid.") counts paid, and paid. as different keys. I want to learn how to normalize punctuation with a regular expression without accidentally changing words.

- **Questions for next time:** punctuation cleanup with regular expressions.
- **Committed to Git:** yes

---

## Weekly quiz scores

| Week | Score (out of 5) | Topics to revisit |
| ---- | ---------------- | ----------------- |
| 1    | 5                | -                 |
| 2    |                  |                   |
