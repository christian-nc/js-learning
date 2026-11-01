// Input: a test label (string), the actual value (any), and the expected value (any).
// Output: undefined (prints a "PASS" or "FAIL" message to the console using strict equality `===`).
// Empty: N/A (all three arguments are required for a meaningful comparison).
// Bad input: missing arguments will evaluate as `undefined`, resulting in a "FAIL" console log.
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// Input: a test label (string), the actual array/object, and the expected array/object.
// Output: undefined (prints a "PASS" or "FAIL" message comparing their JSON stringified forms).
// Empty: N/A (all three arguments are required for a meaningful comparison).
// Bad input / Caveat: JSON.stringify silently converts functions and `undefined` to `null` within arrays/objects. This means `checkList("x", [undefined], [null])` will falsely PASS. A TypeError is only thrown if the input contains circular references.
function checkList(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  console.log(
    `${a === e ? "PASS" : "FAIL"} - ${label} (got ${a}, expected ${e})`
  );
}

// Input: a test name (string), a function to execute, and an optional expected error message substring.
// Output: a boolean (true if the throw check passed, false otherwise) and prints a PASS/FAIL message to the console.
// Empty: the `expectedText` argument is optional; if omitted, it passes as long as the function throws *any* error.
// Bad input / Caveat: If `fn` throws a primitive (like a string) instead of an `Error` object, `error.message` is undefined. This causes `checkThrows` itself to crash with a TypeError when calling `.includes()`. (Hint to fix: check `if (error instanceof Error)` or `typeof error === 'object' && error !== null` before reading `.message`).
function checkThrows(testName, fn, expectedText) {
  try {
    fn();
    // 1. Didn't throw at all
    console.log(`FAIL - ${testName} (expected to throw, but it did not)`);
    return false;
  } catch (error) {
    // 2. Threw, but we didn't ask to check the reason
    if (expectedText === undefined) {
      console.log(`PASS - ${testName} (threw: "${error.message}")`);
      return true;
    }

    // 3. Threw, and the message includes the expected text
    if (error.message.includes(expectedText)) {
      console.log(`PASS - ${testName} (threw: "${error.message}")`);
      return true;
    }

    // 4. Threw, but for the wrong reason
    console.log(
      `FAIL - ${testName} (threw for the wrong reason: "${error.message}", expected text: "${expectedText}")`
    );
    return false;
  }
}

module.exports = {
  check,
  checkList,
  checkThrows,
};
