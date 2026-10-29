# Learning Roadmap: API Integration / Payment Integration Developer

## About this file

I'm learning to become an **API Integration Engineer / Payment Integration Developer** from scratch.

- **Language:** JavaScript / Node.js
- **Study time:** about 3 hours per day, one rest day per week
- **Target:** job-ready in roughly 8 months (about 34 weeks; started 13 October 2026, so around mid-June 2027)
- **Editor:** VS Code with Claude Code

### Instructions for Claude Code (act as my tutor)

- I am a beginner. Teach me, don't just do the work for me.
- In Phases 1-3, do **not** write full solutions. Give hints, explain concepts, and explain error messages. Show complete code only if I ask for it after trying myself.
- Review my code for bugs, bad habits, security issues, and missing edge cases, without rewriting everything.
- At the end of each week, quiz me with 5 questions on that week's topics.
- From Phase 4 onward, you can scaffold and write tests with me, but I must be able to explain every line I commit.
- Explain _why_, not only _how_.
- Payment code handles money, so always point out failure cases, security risks, and what could go wrong.
- Use sandbox/test mode only. Never use real card data.

---

## Daily structure (3 hours)

| Time   | Activity                                                                              |
| ------ | ------------------------------------------------------------------------------------- |
| 60 min | Learn (course, docs, reading)                                                         |
| 90 min | Build (write code myself)                                                             |
| 30 min | Review (ask Claude to explain, quiz, and review; update `LEARNING.md`; commit to Git) |

---

## Phase 1: JavaScript Foundations (Weeks 1-6)

**Setup:** Node.js (LTS), VS Code, Git, GitHub account, `js-learning` repo.

| Week | Topics                                                                                               | Exercises                                                        |
| ---- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1    | Variables (`let`, `const`), data types, operators, conditionals, loops, running code with `node`     | FizzBuzz, temperature converter, number-guessing game            |
| 2    | Functions, arrow functions, scope, arrays (`map`, `filter`, `reduce`), objects                       | Function library (average, max, word counter), inventory tracker |
| 3    | Destructuring, spread, template strings, modules (`import`/`export`), `try/catch`, `fs` module, JSON | CLI expense tracker saving to a JSON file                        |
| 4    | Async JavaScript: callbacks, Promises, `async/await`, event loop, `Promise.all`                      | Simulated delayed operations, sequential vs parallel tasks       |
| 5    | `fetch` in Node, reading API docs, handling errors and bad responses, Postman/curl                   | CLI tool pulling data from a free public API                     |
| 6    | Git branching, pull requests, npm, `package.json`, consolidation                                     | Polished CLI currency converter with README and error handling   |

**Skills to practise throughout Phase 1 (not separate weeks):**

- **Debugging:** reading error messages and stack traces, `console.log` tracing, the VS Code debugger (breakpoints, stepping)
- **Number pitfalls:** why `0.1 + 0.2 !== 0.3`, `Number` vs string input, `NaN`, rounding. This is the reason money is stored as integers later.
- **Dates and time zones:** `Date` basics, UTC vs local time, ISO 8601 strings (payment and settlement records depend on these)
- **Code quality:** ESLint and Prettier set up by Week 3, meaningful names, small functions

**Week 6 checkpoint (do these without help):**

1. Write an async function that fetches JSON from an API and handles a failed request.
2. Explain Promise vs `async/await`.
3. Use `map` and `filter` on an array of objects.
4. Create a repo, branch, commit, and push to GitHub.

**Resources:** javascript.info, freeCodeCamp JavaScript course, The Odin Project (JavaScript path), MDN Web Docs.

---

## Phase 2: Web and API Fundamentals (Weeks 7-10)

- How the web works: HTTP methods (GET/POST/PUT/DELETE), status codes, headers, request/response bodies, cookies, CORS
- REST API design: resources, query params, pagination, versioning, rate limiting
- Build my own API with **Express**
- Call public APIs with Postman, curl, and code
- Idempotency (concept introduction)
- Request validation (for example with `zod`) and consistent error responses
- Configuration with environment variables (`dotenv`), `.gitignore` for secrets from the first Express project
- Reading and writing API documentation: OpenAPI/Swagger basics

**Projects:**

- A REST API (for example, a notes or products API) with full CRUD
- A client script that consumes a public API and handles errors, timeouts, and rate limits

**Resources:** MDN HTTP docs, Postman Learning Center, roadmap.sh (Backend and API Design), Express docs.

---

## Phase 3: Databases, Authentication, and Security (Weeks 11-15)

- **SQL with PostgreSQL:** tables, joins, indexes, constraints, **transactions** (essential for money)
- Using Postgres from Node (`pg` or an ORM such as Prisma)
- Authentication: API keys, Bearer tokens, **OAuth 2.0**, **JWT**, **HMAC signatures**
- Security basics: environment variables and secrets, HTTPS/TLS, input validation, **OWASP Top 10**
- Password hashing (`bcrypt` or `argon2`), SQL injection and parameterized queries
- Database migrations (schema changes tracked in Git)
- **Concurrency:** race conditions, row locking (`SELECT ... FOR UPDATE`), unique constraints. Two requests spending the same balance at once is the classic payment bug.
- **TypeScript basics** (types, interfaces, typing API responses). Most Node.js fintech codebases and job listings use it; convert the Phase 3 project to TypeScript.

**Project:** A REST API with user accounts, a database, protected routes, and secrets kept out of Git.

**Resources:** SQLBolt, PostgreSQL Tutorial, Mode SQL tutorial, OWASP Top 10, PortSwigger Web Security Academy.

---

## Phase 4: Integration Patterns (Weeks 16-20)

- **Webhooks:** receiving events, verifying signatures, handling retries and duplicate events
- **Idempotency keys**, retries with exponential backoff, timeouts, circuit-breaker idea
- Queues and background jobs (concepts, then a simple implementation)
- Logging and error handling: structured logs, request/correlation IDs, never logging secrets or card data
- Monitoring and alerting basics (knowing a webhook or payment flow is failing before a customer reports it)
- **State machines** for orders and payments (pending, succeeded, failed, refunded) and which transitions are allowed
- Testing webhooks locally with a tunnel (ngrok or the provider's CLI)
- Working with a provider SDK vs raw HTTP calls, and handling provider API versions and breaking changes
- **Testing:** unit tests, integration tests, mocking external APIs, using sandboxes (Jest or Vitest)
- Docker basics, deployment (Render, Railway, or a VPS), CI with GitHub Actions

**Project:** A service that receives webhooks from a third-party API, verifies them, stores events safely, and handles duplicates and failures, with tests.

---

## Phase 5: Payments Specialization (Weeks 21-27)

**Concepts:**

- Payment methods: cards, bank transfers, mobile money, wallets
- Authorization vs capture, settlement, refunds, chargebacks, fees, currencies
- Storing money as integers in the smallest unit (never floats)
- Ledgers and double-entry basics, reconciliation
- **PCI DSS** fundamentals: tokenization, hosted checkout, never storing raw card data
- Card authentication: **3D Secure / SCA**, OTP and PIN flows, and handling payments that need an extra customer step
- Payment methods common in Nigeria: bank transfer to virtual accounts, USSD, and how their confirmation differs from cards
- **Payouts and transfers** (money going out, not only coming in), and verifying a bank account before paying it
- Disputes and fraud basics; KYC/AML awareness (what a provider asks merchants for and why)
- Multi-currency and FX: who converts, at what rate, and which amount is recorded
- Reconciling against a provider's settlement report (CSV) and explaining every mismatch
- Data protection basics for customer data (Nigeria's NDPA, plus GDPR for international roles)

**Hands-on (test mode only):**

1. **Stripe** (best documentation, so best for learning)
2. A regional gateway for my market (for example Paystack or Flutterwave)

**Resources:** Stripe docs and guides, Stripe engineering blog (idempotency, API design), Paystack and Flutterwave docs, PCI SSC "PCI DSS Quick Reference Guide".

---

## Phase 6: Portfolio and Job Prep (Weeks 28-34)

### Portfolio projects

1. **E-commerce checkout:** Stripe or Paystack, order states, webhook confirmation
2. **Subscription/billing service:** recurring payments, failed-payment retries, invoices
3. **Multi-provider payment abstraction layer:** one internal API routing to two gateways, with a reconciliation report

Each project needs: a clear README, architecture notes, setup instructions, tests, and a short write-up of design decisions (idempotency, webhook security, failure handling).

### Job prep

- Clean GitHub profile with consistent commits
- Be able to explain: idempotency, webhook signature verification, retries, reconciliation, PCI scope
- Target roles: Junior Backend Developer, Integration Engineer, Fintech Developer, Technical Support Engineer (API), Solutions Engineer
- **Communication:** integration roles involve helping merchants and other developers, so practise writing clear docs, bug reports, and explanations of a failed payment for a non-technical reader
- Interview practice: JavaScript and SQL exercises, a basic system design question ("design a checkout that never double-charges"), mock interviews
- CV and LinkedIn that link to the portfolio; start applying during Phase 5 rather than waiting for Phase 6 to finish

---

## Progress tracker

- [ ] Phase 1: JavaScript Foundations (Weeks 1-6)
- [ ] Phase 2: Web and API Fundamentals (Weeks 7-10)
- [ ] Phase 3: Databases, Auth, and Security (Weeks 11-15)
- [ ] Phase 4: Integration Patterns (Weeks 16-20)
- [ ] Phase 5: Payments Specialization (Weeks 21-27)
- [ ] Phase 6: Portfolio and Job Prep (Weeks 28-34)

## Current status

- **Last updated:** 28 October 2026
- **Current phase:** Phase 1
- **Current week/day:** Week 2 complete (quiz 4.5/5). Week 3, Day 1 (ESLint setup, destructuring, spread/rest, template strings) prepared: `day11-plan.md` and `exercises11.js`.
- **Setup done:** Node.js, VS Code, Git, project folder, GitHub repo (`christian-nc/js-learning`), first commit pushed, Prettier
- **Done so far:** variables, template strings, operators, `if/else`, loops, types and `typeof`, `NaN`, FizzBuzz, temperature converter, kobo price and tax maths, `readline` input and validation, number-guessing game (Week 1); functions, `return`, default parameters, money helpers (`isValidAmount`, `calculateTax`, `formatNaira`, `MAX_KOBO`), `parseGuess`, own `check`/`checkThrows` test helpers (Day 1); function declarations vs expressions vs arrows, hoisting, block vs function scope, `let` vs `var`, closures (`makeCounter`, `makeTaxCalculator`, `makeTotal`), fixing shared state (Day 2); closures remember the variable not the value, arrays by reference, `push` return value, `map`, `filter`, chaining, `isValidRate` as the single rate rule, valid/invalid split with a record-count check (Day 3); objects (dot vs brackets, missing keys give `undefined`, reference comparison), `reduce` with an initial value, `filter` + `reduce` totals, `reduce` into an object (`countByStatus`), `normalizeStatus` as the single status rule (trim, lowercase, reject unknown), `applyDiscountStrict` (all-or-nothing), CSV strings through `map(Number)` then validation, `summarizeDay` with an empty-day case (Day 4); function contracts (input, output, empty, bad input), `Math.max()` and `MAX_SAFE_INTEGER` traps, `Object.keys/values/entries`, independent self-check `countsMatchTotal`, `average` (throws on empty, rounds to whole kobo), `max` via `reduce`, `largestTransaction` (succeeded only, first of a tie), `sumReduce` rejects unsafe running totals, `wordCount` (lowercase, skips empty pieces) (Day 5)
- **Needs more practice:** tests that pass for the wrong reason (Day 5: `checkThrows` passed on "Cannot access 'bigList' before initialization"; the log said fixed but the test was still in the file); spotting silent wrong results (Day 4: `totalSucceeded` and `countByStatus` used different status rules, so the summary disagreed with itself; caught on review, then fixed); not editing expected test values to match output; self-checks that compare independent facts instead of repeating the same logic; tracing an object after it changes (predicted `status: "pending"` after setting it to `"succeeded"`); only committing code I can explain (`?.`, `Set`/`.has()` copied from Reddit, explained afterwards); deleting stale comments after a fix; time-boxing (ask for a hint after 20 minutes stuck)
- **Week 2 plan:** Day 1 functions (done); Day 2 arrow functions and scope (done); Day 3 arrays, `map`, `filter` (done); Day 4 `reduce` and objects (done); Day 5 function library (done); Day 6 inventory tracker and Week 2 quiz
- **Next step:** do Week 3 Day 1 (`day11-plan.md`; start with Exercise 0, ESLint setup), then ask Claude to review `exercises11.js` and add a Week 3 Day 1 entry to `LEARNING.md`. Week 3 plan: Day 1 ESLint, destructuring, spread, template strings; Day 2 modules; Day 3 `try/catch` and custom errors; Day 4 `fs` and JSON; Days 5-6 CLI expense tracker and Week 3 quiz
