const http = require("http");

const server = http.createServer((req, res) => {
    console.log("Request received:", req.url);
    if (req.url === "/") {
        res.end("Welcome to Smart Utility Toolkit");
    }else if (req.url === "/about") {
        res.end("This is the About page");
    }else if (req.url === "/contact") {
        res.end("This is the Contact page");
    }else {
        res.statusCode = 404;
        res.end("404 - Page Not Found");
    }
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});