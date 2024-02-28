const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => { //when there is no endpoint
    res.send('Hello!');
});
// for different endpoints, respond with different response
app.get('/urls.json', (req, res) => {
    res.json(urlDatabase); //.json converts the string to object
});

app.get('/hello', (req, res) => {
    res.send('<html><body>Hello <b>World</b></body></html>\n'); //We will see Hello (and a bold) World in the browser
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});