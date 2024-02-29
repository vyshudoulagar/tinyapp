const express = require('express');
const app = express();
const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get('/urls', (req, res) => {
    const templateVars = { urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
    res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    const data = req.body.longURL;
    const id = generateRandomString();
    urlDatabase[id] = data;
    res.redirect(`/u/${id}`);
});

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    if (urlDatabase[id]) {
        delete urlDatabase[id];
        res.redirect('/urls');
    } else {
        res.status(404).send('URL not found');
    }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortURL = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        shortURL += charset[randomIndex];
    }
    return shortURL;
};