const MAX_KOBO = 99900000000000;

// Input: a kobo amount.
// Output: true if it is a valid positive safe integer within MAX_KOBO.
// Empty: 0 returns false.
// Bad input: non-numbers, decimals, unsafe integers and out-of-range
// amounts return false.
const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

// Input: a valid kobo amount or zero.
// Output: a Naira string formatted to two decimal places.
// Empty: zero is allowed and returns ₦0.00.
// Bad input: invalid amounts throw an Error.
const formatNaira = (kobo) => {
  if (kobo !== 0 && !isValidAmount(kobo)) {
    throw new Error("Invalid kobo amount for formatting");
  }
  return "₦" + (kobo / 100).toFixed(2);
};

// Input: an array of valid kobo amounts.
// Output: the total amount in kobo.
// Empty: an empty array returns 0.
// Bad input: invalid amounts and unsafe running totals throw Errors.
const sumReduce = (list) => {
  return list.reduce((total, amount) => {
    if (!isValidAmount(amount)) {
      throw new Error(`Invalid amount detected: ${amount}`);
    }

    const newTotal = total + amount;

    // Check if the new running total is still a safe integer
    if (!Number.isSafeInteger(newTotal)) {
      throw new Error(
        `Running total exceeded safe integer limits: ${newTotal}`
      );
    }

    return newTotal;
  }, 0);
};

module.exports = {
  MAX_KOBO,
  isValidAmount,
  formatNaira,
  sumReduce,
};
