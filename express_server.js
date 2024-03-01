const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());

const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.get('/urls', (req, res) => {
    const templateVars = { username: req.cookies["username"], urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
    const templateVars = { username: req.cookies["username"] }
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    const data = req.body.longURL;
    const id = generateRandomString();
    urlDatabase[id] = data;
    res.redirect(`/u/${id}`);
});

app.get("/u/:id", (req, res) => {
    const templateVars = { username: req.cookies["username"], id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
    const id = req.params.id;
    if (urlDatabase[id]) {
        delete urlDatabase[id];
        res.redirect('/urls');
    } else {
        res.redirect('/urls');
    }
});

app.post("/urls/:id", (req, res) => {
    const longURL = req.body.longURL;
    const id = req.params.id;
    urlDatabase[id] = longURL;
    res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
    const username = req.body.username;
    res.cookie('username', username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    const username = req.body.username;
    res.clearCookie('username');
    res.redirect("/urls");
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