// Week 1, Day 2 - exercises
// Plan and reading list: day02-plan.md
// Run with: node exercises02.js

let name = "Ilya";

console.log( `hello ${1}` ); // hello 1 ?

console.log( `hello ${"name"}` ); // hello name ?

console.log( `hello ${name}` ); // hello Ilya ?

console.log(5 > 4); // True
console.log("apple" > "pineapple"); // False
console.log("2" > "12"); // True
console.log(undefined == null); // True
console.log(undefined === null); // False
console.log(null == "\n0\n"); // False
console.log(null === +"\n0\n"); // False

if ("0") {
  console.log( 'Hello' );
}


// Using the if..else construct, write the code which asks: ‘What is the “official” name of JavaScript?’

// If the visitor enters “ECMAScript”, then output “Right!”, otherwise – output: “You don’t know? ECMAScript!”

let result = 'ECMAScript';

if (result === 'ECMAScript') {
  console.log('Right!');
} else {
  console.log("You don’t know? ECMAScript!");
}


// Rewrite this if using the conditional operator '?':

// let answer;

// if (a + b < 4) {
//   answer = 'Below';
// } else {
//   answer = 'Over';
// }
let a = 1;
let b = 2;

let answer = (a + b < 4) ? "Below" : "Over";

// Rewrite if..else using multiple ternary operators '?'.

// For readability, it’s recommended to split the code into multiple lines.

// let message;

// if (login == 'Employee') {
//   message = 'Hello';
// } else if (login == 'Director') {
//   message = 'Greetings';
// } else if (login == '') {
//   message = 'No login';
// } else {
//   message = '';
// }

// my answer:

let login = 'Employee'; // or 'Director' or ''
let text =  (login === 'Employee') ? 'Hello' :
		    (login === 'Director') ? 'Greetings' :
			(login === '') ? 'No login' :
			'';
console.log(text);


let userName = 'Admin';

if (userName === 'Admin') {

    let pass = 'TheMaster';

    if (pass === 'TheMaster') {
        console.log('Welcome!');
    } else if (pass === '' || pass === null) {
        console.log ('canceled');
    } else { 
        console.log('Wrong password');
    }

} else if (userName === '' || userName === null) {
    console.log('canceled');
} else {
    console.log("I don't know you");
}

// Rewrite the code changing the for loop to while without altering its behavior (the output should stay same).

//for (let i = 0; i < 3; i++) {
//  console.log(`number ${i}!` );
//}

//My Answer:

let j = 0;

while (j < 3) {
	console.log(`number ${j}!`);
	j++;
}





// 1. Type detective
// Before running, write your guess as a comment next to each line.
// Then print typeof for each value and compare with your guess.
// Values: 
console.log(typeof"4500"); // string 
console.log(typeof 4500); // number
console.log(typeof true); // boolean 
console.log(typeof undefined); // undefined
console.log(typeof null); // object 
console.log(typeof 4500 + "1"); // typeof 4500 + "1" evaluates as (typeof 4500) + "1", which is "number" + "1", resulting in the string "number1"
console.log(typeof  "10" * 2); // typeof "10" gives the string "string", and "string" * 2 is NaN. It's still type number, because NaN is a number


// 2. Loop tracing
// On paper, write every value this loop prints and how many times the body runs.
// Then uncomment it and check.
//
for (let i = 10; i > 0; i = i - 3) {
    console.log(i);
}

 // Round 1: Check 10 > 0 (true), print 10, update i to 7.
 // Round 2: Check 7 > 0 (true), print 7, update i to 4.
 // Round 3: Check 4 > 0 (true), print 4, update i to 1.
 // Round 4: Check 1 > 0 (true), print 1, update i to -2.
 // Round 5: Check -2 > 0 (false), stop without printing.

 // Values printed: 10, 7, 4, 1.
 // The body runs 4 times.



// 3. Grade calculator
// Given a score from 0 to 100, print the grade:
// 70 and above "A", 60-69 "B", 50-59 "C", 45-49 "D", below 45 "F".
// Test it with 70, 69, 45, 44, and 0.
// Extra: what should happen for a score of 120 or -5?

let score = 72;

if (isNaN(score)) {
    console.log("invalid score");
}
else if (score > 100 || score < 0) {
	console.log("invalid score");
} else if (score >= 70) {
  console.log ('A');
} else if (score >= 60) {
  console.log('B');
} else if (score >= 50) {
  console.log('C');
} else if (score >= 45) {
  console.log('D');
 }else {
	console.log('F');
}

// 120 or -5 will return invalid score


// 4. Transaction check
// Given: balanceKobo, amountKobo, and accountActive (true or false).
// Print "Approved" only if the account is active AND the amount is more than 0
// AND the balance is enough. Otherwise print "Declined" with the reason.
// Test all the cases: inactive account, amount of 0, amount larger than balance, a valid payment.


function checkTransaction(balanceKobo, amountKobo, accountActive) {
    if (isNaN(amountKobo)) {
        console.log("Declined: Invalid amount");
    } else if (!accountActive) {
        console.log("Declined: Account is inactive");
    } else if (amountKobo <= 0) {
        console.log("Declined: Invalid amount");
    } else if (balanceKobo < amountKobo) {
        console.log("Declined: Insufficient balance");
    } else {
        console.log("Approved");
    }
}


checkTransaction(1000, 500, true);   // Valid payment
checkTransaction(1000, 500, false);  // Inactive account
checkTransaction(1000, 2000, true);  // Insufficient balance
checkTransaction(1000, 0, true);     // Invalid amount
checkTransaction(1000, NaN, true);   // Invalid amount (NaN)

// 5. Sum of 1 to 100
// a) Add the numbers 1 to 100 with a for loop and print the total (it should be 5050).
// b) Do the same with a while loop.

// my answer 1:

let totalFor = 0;

for (let i = 1; i <= 100; i++) {
totalFor += i;
}
console.log("For loop total:", totalFor);

// my answer 2:

let totalWhile = 0;
let i = 1;

while (i <= 100) {
  totalWhile += i;
  i++;
}
console.log("While loop total:", totalWhile);



// 6. Multiplication table
// Given a number n, print its table from 1 to 12, one line each, like: 7 x 3 = 21

// my answer:

let n = 7;
for (let i = 1; i <= 12; i++) {
    console.log(`${n} x ${i} = ${n * i}`);
}




// 7. FizzBuzz
// Print the numbers 1 to 100. But:
// - for multiples of 3 print "Fizz" instead of the number
// - for multiples of 5 print "Buzz"
// - for multiples of both 3 and 5 print "FizzBuzz"
// Check: 15 must print "FizzBuzz", not "Fizz".

// my answer: 

for (let i = 1; i <= 100; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
        console.log("FizzBuzz");
    } else if (i % 3 === 0) {
        console.log("Fizz");
    } else if (i % 5 === 0) {
        console.log("Buzz");
    } else {
        console.log(i);
    }
}

