const operation = process.argv[2];
const num1 = Number(process.argv[3]);
const num2 = Number(process.argv[4]);

console.log("Operation:", operation);
console.log("Number 1:", num1);
console.log("Number 2:", num2);

let result;

console.log("Starting Calculation...");
if (operation === "add") {
    result = num1 + num2;
}
else if (operation === "subtract") {
    result = num1 - num2;
}
else if (operation === "multiply") {
    result = num1 * num2;
}
else if (operation === "divide") {
    result = num1 / num2;
}
else {
    console.log("Invalid operation");
    process.exit();
}
console.log("Calculation finished.")
console.log("Result:", result);