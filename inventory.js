// Week 2, Day 6 - inventory tracker
// Plan and reading list: day10-plan.md
// Run with: node inventory.js

// ---------------------------------------------------------------
// Exercise 0 (in library.js, not here): fix two leftover tests
// a) Run `node library.js` and read the "Running total exceeded" lines. One of them
//    passes for the wrong reason. Which message proves it? Remove or move that test.
// It says cannot access bigList before initialization. Have removed it
// b) "throws on empty list" for largestTransaction appears twice. Keep one.
// Fixed
// c) Your Day 5 log says the bigList test was fixed. Write one line in LEARNING.md
//    about how you'll make sure "fixed" in the log means fixed in the file.
// Done

// Same helpers as before. check uses === on purpose (no type coercion).
function check(label, actual, expected) {
  const ok = actual === expected;
  console.log(
    `${ok ? "PASS" : "FAIL"} - ${label} (got ${actual}, expected ${expected})`
  );
}

// Compares arrays AND objects as JSON text. Key order must match.
function checkList(label, actual, expected) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  console.log(
    `${a === e ? "PASS" : "FAIL"} - ${label} (got ${a}, expected ${e})`
  );
}

// Prints the error message so you can see WHY it threw. Read it every time.
function checkThrows(testName, fn) {
  try {
    fn();
    console.log(`FAIL - ${testName} (expected to throw, but it did not)`);
    return false;
  } catch (error) {
    console.log(`PASS - ${testName} (threw: "${error.message}")`);
    return true;
  }
}

// Copy MAX_KOBO, isValidAmount and sumReduce from library.js here.
// (Week 3: modules will let you import them instead.)
const MAX_KOBO = 99900000000000;

const isValidAmount = (kobo) => {
  if (typeof kobo !== "number") return false;
  return Number.isSafeInteger(kobo) && kobo >= 1 && kobo <= MAX_KOBO;
};

const sumReduce = (list) => {
  return list.reduce((total, amount) => {
    if (!isValidAmount(amount)) {
      throw new Error(`Invalid amount detected: ${amount}`);
    }

    const newTotal = total + amount;

    if (!Number.isSafeInteger(newTotal)) {  // Check if the new running total is still a safe integer
      throw new Error(
        `Running total exceeded safe integer limits: ${newTotal}`
      );
    }

    return newTotal;
  }, 0);
};
// ---------------------------------------------------------------
// The inventory. priceKobo is the price of ONE item. stock is how many we have.
// makeInventory() returns a FRESH copy each time, so one exercise's changes
// can't leak into the next. Use it at the start of each exercise.

const makeInventory = () => [
  { sku: "RICE-5KG", name: "Rice 5kg", priceKobo: 850000, stock: 12 },
  { sku: "OIL-1L", name: "Vegetable oil 1L", priceKobo: 240000, stock: 3 },
  { sku: "SUGAR-1KG", name: "Sugar 1kg", priceKobo: 120000, stock: 0 },
  { sku: "MILK-400G", name: "Powdered milk 400g", priceKobo: 310000, stock: 7 },
];

// ---------------------------------------------------------------
// Exercise 1: Warm-up, trace an object (predict, then run)
// Write your prediction in a comment above each console.log.

const inv1 = makeInventory();
const oil = inv1[1];
oil.stock = oil.stock - 1;

// prediction: 2
console.log(inv1[1].stock);
// prediction: true
console.log(oil === inv1[1]);

const sameShelf = inv1;
sameShelf[0].stock = 0;

// prediction: 0
console.log(inv1[0].stock);

const fresh = makeInventory();
// prediction: 12
console.log(fresh[0].stock);
// prediction: false
console.log(fresh[1] === inv1[1]);

let rice = inv1[0];
rice = { sku: "RICE-5KG", name: "Rice 5kg", priceKobo: 850000, stock: 99 };

// prediction (careful: is this a change to the object, or to the variable?): 0 
// makes the variable rice point at a new object. 
// The original rice object in inv1 is untouched, so it still shows 0.
console.log(inv1[0].stock);

// Question (comment): which lines above CHANGED an object, and which only made a
// variable point somewhere else? How can you tell by looking at the line?
// line 89, 97 changed an object, 88, 96, 102 and 109 only made a variable point elsewhere

// ---------------------------------------------------------------
// Exercise 2: findProduct(inventory, sku)
// Returns the product OBJECT (not a copy) whose sku matches exactly.
// First, predict then run:

// prediction: undefined
console.log(makeInventory().find((p) => p.sku === "BEANS-1KG"));

// Question (comment): if findProduct returned that value and the caller did
// product.stock - 1, what would happen? What if the caller did product?.stock - 1?
// Which one is the silent failure?
// product.stock - 1 will throw a TypeError because I am trying to access .stock on undefined
// for product?.stock - 1? :  product?.stock checks whether product is null or undefined.
// Because it is undefined, the expression returns undefined
// JavaScript then evaluates undefined - 1, which produces NaN.
// The silent failure is the second one: product?.stock - 1, 
// when it produces NaN and the program doesn't detect it

// Contract (input, output, empty input, bad input):
// For a valid inventory and existing SKU	- Return the original product object
// For an Unknown SKU - Throw an error
// If SKU is not a string	- Throw an error
// Empty inventory - Throw an error
// Wrong letter case	- No match; throw an error
// I want case sensistive matching because in payment, different case letters might mean different things
// It is a good practice to stick to everytime 

// write findProduct here
const findProduct = (inventory, sku) => {
  if (!Array.isArray(inventory) || inventory.length === 0) {
    throw new Error("This must be an array");
  }

  if (typeof sku !== "string" || sku.trim() === "") {
    throw new Error("SKU must be a non-empty string");
  }

  const product = inventory.find((p) => p.sku === sku);

  if (!product) {
    throw new Error(`Product not found: ${sku}`);
  }

  return product;
};
const inv2 = makeInventory();
check("finds oil", findProduct(inv2, "OIL-1L").name, "Vegetable oil 1L");
check("returns the same object", findProduct(inv2, "OIL-1L") === inv2[1], true);
checkThrows("unknown sku", () => findProduct(inv2, "BEANS-1KG"));
checkThrows("sku must be a string", () => findProduct(inv2, 42));
checkThrows("empty inventory", () => findProduct([], "OIL-1L"));
// Decide: is "oil-1l" the same sku as "OIL-1L"? Write your decision in the
// contract and add a test that proves it.
checkThrows("Case sensitive matching", () => findProduct(inv2, "oil-1l"));

// ---------------------------------------------------------------
// Exercise 3: addStock and removeStock
// Both change the product's stock and return the NEW stock level.
// Quantity must be a positive whole number. Reuse findProduct.
//
// removeStock is the "spend from a balance" function:
//   - It must never take stock below 0.
//   - ALL-OR-NOTHING: if it throws, the stock must be exactly what it was before.
//     (Same idea as applyDiscountStrict on Day 4.)
// Hint: what order should "check" and "change" happen in?

// Contract for addStock:
//  Input: inventory is valid, sku exists in inventory
//  input: Number.isSafeInteger(qty) === true && qty > 0
//  output: product.stock increases by qty
//  output: Returns the new product.stock
//  Throws: Error if qty <= 0 or not a safe integer
//  Throws: Error if new stock exceeds MAX_SAFE_INTEGER
// write addStock here
const addStock = (inventory, sku, qty) => {
  const product = findProduct(inventory, sku);

  if (!Number.isSafeInteger(qty) || qty <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  const newStock = product.stock + qty;
  
  if (!Number.isSafeInteger(newStock)) {
    throw new Error("Stock exceeds safe integer limits")
  }

  product.stock = newStock;

  return product.stock;
};
// Contract for removeStock:
// inventory must be a valid, mutable inventory object.
// sku must be a string that corresponds to an existing product in the inventory.
// qty must be a safe integer.
// qty must be strictly greater than zero.
// qty must be less than or equal to the current stock of the product.
// The stock property of the product identified by sku is decremented by exactly qty.
// The function returns the new stock value of the product.
// write removeStock here
const removeStock = (inventory, sku, qty) => {
  const product = findProduct(inventory, sku);

  if (!Number.isSafeInteger(qty) || qty <= 0) {
    throw new Error("Quantity must be a positive integer");
  }

  if (qty >product.stock) {
    throw new Error("Insufficient stock")
  }

  product.stock -= qty;

  return product.stock;
};
const inv3 = makeInventory();
check("add 5 rice", addStock(inv3, "RICE-5KG", 5), 17);
check("remove 2 oil", removeStock(inv3, "OIL-1L", 2), 1);
check("remove last oil", removeStock(inv3, "OIL-1L", 1), 0);
checkThrows("remove from empty", () => removeStock(inv3, "OIL-1L", 1));
check("oil still 0 after failed remove", findProduct(inv3, "OIL-1L").stock, 0);
checkThrows("remove too many milk", () => removeStock(inv3, "MILK-400G", 8));
check("milk unchanged after failed remove", findProduct(inv3, "MILK-400G").stock, 7);
checkThrows("quantity 0", () => addStock(inv3, "RICE-5KG", 0));
checkThrows("negative quantity", () => addStock(inv3, "RICE-5KG", -3));
checkThrows("decimal quantity", () => removeStock(inv3, "MILK-400G", 1.5));
checkThrows("quantity as string", () => addStock(inv3, "RICE-5KG", "5"));
check("rice unchanged after bad adds", findProduct(inv3, "RICE-5KG").stock, 17);
checkThrows("addStock with 0 qty throws error", () => addStock(inv3, "RICE-5KG", 0));
check("addStock with 0 qty does not mutate stock", findProduct(inv3, "RICE-5KG").stock, 17);
// Question (comment): why is removeStock(inv, "OIL-1L", -3) dangerous if you
// forget to reject negatives? (Think: "withdraw -3000 kobo".)
// It will turn a subtraction into an addition which is dangerous
// ---------------------------------------------------------------
// Exercise 4: stockValue(inventory)
// The total value of everything on the shelves, in kobo: sum of priceKobo * stock.
// Try reusing sumReduce first (one rule in one place), then run it on
// makeInventory(). Predict before you run:
// prediction:
//
// Something in the inventory will clash with one of your library's rules.
// Question (comment): which rule, which product, and is the RULE wrong or is
// this a different situation? Write your decision in the contract, then make it work.
// Don't loosen isValidAmount for everyone without saying why.
// stockValue(makeInventory()) should return 13090000 kobo. The first implementation throws because the zero value for Sugar violates sumReduce's payment-amount validation rule
// The rule is isValidAmount, which requires an amount to be at least 1 kobo. Sugar is the product causing the clash because its stock is 0, 
// making its total inventory value 0. not a wrong for payment amounts, inventory valuation is a different situation. I will keep the payment validation rule unchanged 
// and validate inventory values separately which will allow zero while still rejecting unsafe integers.
// Contract:
// input: Each product object must contain: priceKobo: A safe integer where 1 <= priceKobo <= MAX_KOBO and stock: A safe integer where stock >= 0.
// Output: Returns a single safe integer representing the total value of the entire inventory in kobo
// Empty Input: If inventory is an empty array ([]), the function safely returns 0.
// bad input: hrows an error for an invalid unit price, invalid stock quantity, unsafe product value, or unsafe running total.
// Zero stock: Allowed. A product with zero stock contributes zero to the total.
// All-or-nothing: The function only calculates a value; it does not modify the inventory.

const stockValue = (inventory) => {
  if (!Array.isArray(inventory)) {
    throw new Error("Inventory must be an array");
  }

  const productValues = inventory.map((product) => {
    const { priceKobo, stock } = product;

    if (!isValidAmount(priceKobo)) {
      throw new Error("Invalid price of product");
    }

    if (!Number.isSafeInteger(stock) || stock < 0) {
      throw new Error("Invalid stock quantity");
    }

    const value = priceKobo * stock;

    if (!Number.isSafeInteger(value)) {
      throw new Error("Product value exceeds safe integer limits");
    }

    return value;
  });

  return productValues.reduce((total, value) => {
    const newTotal = total + value;

    if (!Number.isSafeInteger(newTotal)) {
      throw new Error("Inventory total exceeds safe integer limits");
    }

    return newTotal;
  }, 0);
};

// Work out the expected total BY HAND first, and write the sum here:
//   rice:  850000 * 12 = 10,200,000
//   oil: 720,000
//   sugar: 120000 * 0 = 0
//   milk:310000 * 7 = 2,170,000
//   total:13090000
check("stock value", stockValue(makeInventory()), 13090000);
check("empty inventory value", stockValue([]), 0);
// Add a test for a product whose priceKobo * stock is not a safe integer.

checkThrows("unsafe product value", () =>
  stockValue([
    {
      sku: "TEST-1",
      name: "Test product",
      priceKobo: 850000,
      stock: Number.MAX_SAFE_INTEGER,
    },
  ])
);

// ---------------------------------------------------------------
// Exercise 5: lowStock(inventory, threshold)
// Returns the SKUs (array of strings) of products with stock BELOW threshold,
// in inventory order. Use filter then map.

// Contract (what about threshold 0, a negative threshold, or "5"?):
// Input: inventory must be an array of product objects. Each product must have a stock value and sku. threshold must be a non-negative integer
// Output: array of SKU strings that their product is strictly below threshold. Returns empty array if no match
// Empty Input: an empty inventory will return []
// Bad Input: throws an error if threshold is not non negative
// throws an error if a product has invalid stock value or SKU
// returns [] for threshold 0 because no valid non negative stock value can be below zero
// write lowStock here
const lowStock = (inventory, threshold) => {
  if (!Number.isSafeInteger(threshold) || threshold < 0) {
    throw new Error("Threshold must be a non-negative integer");
  }
  if (!Array.isArray(inventory)) {
  throw new Error("Inventory must be an array");
}

  for (const product of inventory) {
    if (
      !Number.isSafeInteger(product.stock) ||
      product.stock < 0
    ) {
      throw new Error("Invalid product stock");
    }

    if (typeof product.sku !== "string" || product.sku.trim() === "") {
      throw new Error("Invalid product SKU");
    }
  }

  return inventory
    .filter((product) => product.stock < threshold)
    .map((product) => product.sku);
};
checkList("below 5", lowStock(makeInventory(), 5), ["OIL-1L", "SUGAR-1KG"]);
checkList("below 1 (out of stock)", lowStock(makeInventory(), 1), ["SUGAR-1KG"]);
checkList("nothing below 0", lowStock(makeInventory(), 0), []);
checkThrows("threshold as string", () => lowStock(makeInventory(), "5"));

// ---------------------------------------------------------------
// Exercise 6: applyMovements(inventory, movements)
// A batch of stock movements from one day, applied in order:

const movements = [
  { sku: "RICE-5KG", type: "in", qty: 10 },
  { sku: "OIL-1L", type: "out", qty: 2 },
  { sku: "MILK-400G", type: "out", qty: 3 },
];

const badMovements = [
  { sku: "RICE-5KG", type: "in", qty: 10 },
  { sku: "OIL-1L", type: "out", qty: 2 },
  { sku: "OIL-1L", type: "out", qty: 5 }, // not enough oil left
  { sku: "MILK-400G", type: "out", qty: 3 },
];

// a) First, the obvious version: a loop that calls addStock/removeStock for
//    each movement. Run it on badMovements with a fresh inventory, catch the
//    error, then print rice's stock.
// prediction (rice stock after the failed batch): 
// Prediction: rice stock will be 22 after the failed batch.
// Why my original prediction was wrong: I assumed the failed batch would undo previous changes, but the loop updates stock immediately. 
// Rice increased from 12 to 22 before the oil movement threw an error.
const inv = makeInventory();

try {
  for (const m of badMovements) {
    if (m.type === "in") {
      addStock(inv, m.sku, m.qty);
    } else if (m.type === "out") {
      removeStock(inv, m.sku, m.qty);
    } else {
      throw new Error(`Unknown movement type: ${m.type}`);
    }
  }
} catch (error) {
  console.log("Batch failed:", error.message);
}

console.log(
  "Rice stock after failed batch:",
  findProduct(inv, "RICE-5KG").stock
);

// Question (comment): the batch "failed", but did it change anything? If this
// were a bank batch of 4 transfers, what would the customer see?
// Yes it still changed the inventory. 
// customer will see batch failed but 2 transfers already went through. If they press retry, those 2 run again and get paid twice.

// b) Now make applyMovements ALL-OR-NOTHING for the whole batch: if any movement
//    would fail, throw and change NOTHING.
//    Hint: two passes. The first pass only checks. The second pass only changes.
//    Hint: two movements for the same sku in one batch (like OIL-1L above) is
//    the hard case. Does checking each movement against the CURRENT stock catch it?
//    Unknown type (not "in" or "out") must throw too.

// Contract:
// Input: inventory must be valid array of products and movements array of objects with sku, type, qty
// Output: changes the inventory in place. reurns undefined
// rules: type must be exaclty "in" or "out". qty must be a positive integer that is safe
// all or nothing: any sign of non validation, function will throw an error and leave inventory untouched
// empty input: do nothing if movement is empty

// write applyMovements here
const applyMovements = (inventory, movements) => {
  if (!Array.isArray(inventory)) throw new Error("Inventory must be an array");
  if (!Array.isArray(movements)) throw new Error("Movements must be an array");

    // Map stores each SKU's simulated final stock, keyed by SKU.
  const changes = new Map();

  // Pass 1: Check and simulate
  for (const movement of movements) {
    if (movement.type !== "in" && movement.type !== "out") {
      throw new Error(`Unknown movement type: ${movement.type}`);
    }
    if (!Number.isSafeInteger(movement.qty) || movement.qty <= 0) {
      throw new Error("Quantity must be a positive integer");
    }
    
    // findProduct throws if SKU is invalid or not found
    const product = findProduct(inventory, movement.sku); 
    
    
    // Get the simulated stock. If we've already simulated a change for this SKU, use that.
    // If this SKU was already simulated, reuse that updated value;
    // otherwise, start with its real stock.
    const currentSimulated = changes.has(movement.sku) 
      ? changes.get(movement.sku) : product.stock;
    
    let newSimulated;
    
    if (movement.type === "in") {
      newSimulated = currentSimulated + movement.qty;
    } else {
      newSimulated = currentSimulated - movement.qty;
    }
    
    if (newSimulated < 0) {
      throw new Error(`Insufficient stock for ${movement.sku}`);
    }
    if (!Number.isSafeInteger(newSimulated)) {
      throw new Error("Stock exceeds safe integer limits");
    }
    
    // Save the simulated state for the next movement in this batch
    changes.set(movement.sku, newSimulated);
  }

  // Pass 2: Apply changes (Only runs if Pass 1 succeeded 100%)
  for (const [sku, finalStock] of changes.entries()) {
    const product = findProduct(inventory, sku);
    product.stock = finalStock;
  }
};


const inv6 = makeInventory();
applyMovements(inv6, movements);
check("rice after batch", findProduct(inv6, "RICE-5KG").stock, 22);
check("oil after batch", findProduct(inv6, "OIL-1L").stock, 1);
check("milk after batch", findProduct(inv6, "MILK-400G").stock, 4);

const inv6b = makeInventory();
checkThrows("bad batch throws", () => applyMovements(inv6b, badMovements));
checkList("bad batch changed nothing", inv6b, makeInventory());
checkThrows("unknown type", () =>
  applyMovements(makeInventory(), [{ sku: "RICE-5KG", type: "sold", qty: 1 }]));

// c) Independent self-check (like countsMatchTotal on Day 5). Without using
//    applyMovements, work out from `movements` alone: total "in", total "out".
//    Then check: (total stock before) + in - out === (total stock after).
//    Use reduce. Don't copy applyMovements' logic.
const countStock = (inv) => inv.reduce((sum, p) => sum + p.stock, 0);

const invCheck = makeInventory();
const totalBefore = countStock(invCheck);

const totalIn = movements
  .filter((movement) => movement.type === "in")
  .reduce((sum, movement) => sum + movement.qty, 0);

const totalOut = movements
  .filter((movement) => movement.type === "out")
  .reduce((sum, movement) => sum + movement.qty, 0);

  applyMovements(invCheck, movements);
const totalAfter = countStock(invCheck);

check("total stock math", totalBefore + totalIn - totalOut, totalAfter);


// ---------------------------------------------------------------
// Exercise 7: Think (comments only)
// 1. Exercise 6b checks everything first, then changes. In a real server, two
//    requests could run at the same time: both check "5 oil left", both remove 4.
//    What would the stock end up as? (You'll fix this properly with database
//    locks in Phase 3. For now, just describe the bug.)
//    The stock would end up as 1
//    Both requests read the stale value of 5, subtract 4, and write 1 back. 
//    The system will accidentally oversell inventory 
//    because the second request doesn't see the first request deduction on time
// 2. Exercise 4: you changed (or didn't change) a library rule for a new
//    situation. In one line, how do you stop "small exceptions" from slowly
//    breaking the rule that protects payment amounts?
//    By keeping the original rule strictly for payments and creating a separate, 
//    specific validation function for the new context instead of loosening the shared rule.
// 3. Day 3-4 functions returned NEW arrays. Today's functions CHANGED objects.
//    Name one advantage and one risk of changing objects in place.
//    It is faster because you avoid the overhead of copying large data structures
//    but If another part of the program holds a reference to 
//    the same object it will unexpectedly see the reference changes, making bugs very hard to catch