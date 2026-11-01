import js from "@eslint/js"; // ESLint's recommended rule set
import globals from "globals"; // tells ESLint that `require`, `process` etc. exist in Node

export default [
  js.configs.recommended,

  // 1. Configuration for .js files (CommonJS)
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs", // your files use require(), not import (yet)
      globals: globals.node,
    },
    rules: {
      eqeqeq: "error", // always === and !==
      "prefer-const": "error", // use const when a variable is never reassigned
      "no-var": "warn", // warn, not error: Day 2 of Week 2 used var on purpose
      "no-unused-vars": "warn",
    },
  },

  // 2. NEW: Configuration for .mjs files (ES Modules)
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module", // tells ESLint these files use import/export
      globals: globals.node,
    },
    rules: {
      eqeqeq: "error",
      "prefer-const": "error",
      "no-var": "warn",
      "no-unused-vars": "warn",
    },
  },
];
