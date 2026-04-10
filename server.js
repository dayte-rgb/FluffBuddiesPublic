// Import the Express module, which is a framework for building web applications in Node.js.
const express = require('express');
const path = require('path');

// Create an instance of an Express application. This app object will be used to define routes and middleware.
const app = express();

// Define a constant for the port number on which the server will listen.
const PORT = 3000;

// Middleware for handling static files
app.use(express.static('public'));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Start the server and make it listen on the specified port.
// Once the server starts, it logs a message to the console indicating where it is running.
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define a route handler for GET requests to the URL ('/default')
app.get('/default', (req, res) => {
    // Render the 'default' template and pass an object with dynamic data.
    res.render('default', {
        name: 'Student', // A variable named 'name' with the value 'Student'.
        items: ['Apples', 'Bananas', 'Cherries'] // An array named 'items' containing a list of fruits.
    });
});