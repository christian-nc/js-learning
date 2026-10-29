import js from "@eslint/js"; // ESLint's recommended rule set
import globals from "globals"; // tells ESLint that `require`, `process` etc. exist in Node

export default [
  js.configs.recommended,
  {
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
];
