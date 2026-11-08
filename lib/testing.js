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
// Empty: the `expectedText` argument is optional; if omitted, it passes as long as the function throws any error.
// Bad input / Caveat: If the thrown value is not an Error instance, the message is derived by converting the value to a string using `String(error)`.
function checkThrows(testName, fn, expectedText) {
  try {
    fn();
    // 1. Didn't throw at all
    console.log(`FAIL - ${testName} (expected to throw, but it did not)`);
    return false;
  } catch (error) {
    // Safely extract the message whether it's an Error object or a primitive (like a string)
    const message = error instanceof Error ? error.message : String(error);

    // 2. Threw, but we didn't ask to check the reason
    if (expectedText === undefined) {
      console.log(`PASS - ${testName} (threw: "${message}")`);
      return true;
    }

    // 3. Threw, and the message includes the expected text
    if (message.includes(expectedText)) {
      console.log(`PASS - ${testName} (threw: "${message}")`);
      return true;
    }

    // 4. Threw, but for the wrong reason
    console.log(
      `FAIL - ${testName} (threw for the wrong reason: "${message}", expected text: "${expectedText}")`
    );
    return false;
  }
}

// input: fn (function) - A function that may throw an error when executed. It can throw any value, including Error objects, strings, numbers, or other types.
// output: object - If fn throws an error, return whatever was thrown, unchanged. If fn does not throw, return a special object with name "NoError" and message "nothing was thrown".
// bad input: Any non-function input causes a TypeError when fn() is called, which is caught and returned unchanged.
// empty: N/A - There is no concept of an "empty" input in this context; the function always expects a callable function as input.
function catchError(fn) {
  try {
    fn();
    // If nothing was thrown, return a special object with name "NoError"
    return { name: "NoError", message: "nothing was thrown" };
  } catch (error) {
    // Something was thrown
    // Return the error object itself, which may be an Error or any other value
    return error;
  }
}

module.exports = {
  check,
  checkList,
  checkThrows,
  catchError,
};
