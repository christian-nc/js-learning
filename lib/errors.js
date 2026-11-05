class ValidationError extends Error {
  constructor(message, field, options) {
    super(message, options); // Let the base Error class set up the message and stack trace
    this.name = "ValidationError"; // Change the name tag from "Error" to "ValidationError"
    this.field = field; // Store the specific field that caused the problem
  }
}

class ProviderError extends Error {
  constructor(message, provider, options) {
    super(message, options); // Let the base Error class set up the message and stack trace
    this.name = "ProviderError"; // Change the name tag from "Error" to "ProviderError"
    this.provider = provider; // Store which payment provider failed
  }
}

module.exports = {
  ValidationError,
  ProviderError,
};
