import { MAX_KOBO, isValidAmount } from "./money.mjs";

console.log(isValidAmount(5000));
console.log(isValidAmount(MAX_KOBO + 1));

// Prediction: Module not found
// Error: Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\Halfmortal\Documents\js-learning\esm\money' imported from C:\Users\Halfmortal\Documents\js-learning\esm\main.mjs
// import { MAX_KOBO, isValidAmount } from "./money";

// Prediction: require is not used in ES modules
// Error: ReferenceError: require is not defined in ES module scope, you can use import instead
// const fs = require("fs");

// error  'console' is not defined  no-undef
// AFTER FIX: error  Expected '===' and instead saw '=='  eqeqeq
// console.log(isValidAmount == true);
