const fs = require("fs");
const operation = process.argv[2];
const fileName = "sample.txt";

if (operation === "create") {
    console.log("Starting file creation...");
    fs.writeFile(fileName, "Hello from Node.js", (err) => {
        if (err) {
            console.log("Error creating file");
            return;
        }
        console.log("File created successfully");
    });
    console.log("File creation request sent");

}else if (operation === "read") {
    fs.readFile(fileName, "utf-8", (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                console.log("File does not exist.");
            } else {
                console.log("Error reading file");
            }
            return;
        }
        console.log("File contents:");
        console.log(data);
    });

}else if (operation === "update") {
    fs.appendFile(fileName, "\nThis is new data.", (err) => {
        if (err) {
            if (err.code === "ENOENT") {
                console.log("File does not exist.");
            } else {
                console.log("Error updating file");
            }
            return;
        }
        console.log("File updated successfully");
    });

}else if (operation === "delete") {
    fs.unlink(fileName, (err) => {
        if (err) {
            if (err.code === "ENOENT") {
                console.log("File does not exist.");
            } else {
                console.log("Error deleting file");
            }
            return;
        }
        console.log("File deleted successfully");
    });

}else {
    console.log("Invalid operation.");
    console.log("Use: create, read, update, or delete");
}