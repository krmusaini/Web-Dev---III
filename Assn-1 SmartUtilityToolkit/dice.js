const crypto = require("crypto");
const fs = require("fs");

let history = "";

for (let i = 1; i <= 5; i++) {
    const dice = crypto.randomInt(1, 7);
    console.log("Roll " + i + ":", dice);
    history += "Roll " + i + ": " + dice + "\n";  // the history roll 
}

fs.appendFile("dice-history.txt", history, (err) => {
    if (err) {
        console.log("Error saving dice history");
        return;
    }
    console.log("Dice history saved successfully!");
});