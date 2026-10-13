const country = "Nigeria";
const name = "Christian";
let goal = "become a payment integration engineer";

console.log(`Hello, my name is ${name} and I am from ${country} and my goal is to ${goal}.`);

let Celsius = 100;
const Fahrenheit = (Celsius * 9/5) + 32;
console.log(`${Celsius} degrees Celsius is equal to ${Fahrenheit} degrees Fahrenheit.`);


let price = 4500;
let quantity = 3;
console.log(`The total cost is ${price * quantity} and the grand total cost with 7.5% tax is ${price * quantity * 1.075}.`);

let age = 20;

if (age >= 18) {
    console.log("Adult");
} else {
    console.log("minor");
}

for (let i = 1; i <= 10; i++) {
    console.log(i);
}

for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) {
        console.log(i);
    }
}


const priceKobo = 450000;
//const quantity = 3;
const taxRate = 0.075;

const subtotal = priceKobo * quantity;
const tax = Math.round(subtotal * taxRate);
const grandTotal = subtotal + tax;

console.log(`Subtotal: N${(subtotal / 100).toFixed(2)}`);
console.log(`Tax: N${(tax / 100).toFixed(2)}`);
console.log(`Total: N${(grandTotal / 100).toFixed(2)}`);

