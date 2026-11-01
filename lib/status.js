const KNOWN_STATUSES = new Set(["succeeded", "failed", "pending"]);

// Input: a transaction status string.
// Output: the trimmed, lowercase version of a known status.
// Empty: an empty or whitespace-only string throws an Error.
// Bad input: non-strings and unknown statuses throw Errors.
const normalizeStatus = (status) => {
  if (typeof status !== "string") {
    throw new Error(`Invalid transaction status: ${status}`);
  }

  const normalized = status.trim().toLowerCase();
  if (!KNOWN_STATUSES.has(normalized)) {
    throw new Error(`Unknown transaction status: ${status}`);
  }

  return normalized;
};

module.exports = {
  normalizeStatus,
};
