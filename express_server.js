const express = require('express');
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());

const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const users = {
    userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk",
    },
};

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

app.post("/register", (req, res) => {
    if (req.body["email"].trim() === '' || req.body["password"].trim() === '') {
        res.status(400).send('Email or password cannot be empty');
        return;
    }

    const foundUser = getUserByEmail(req.body["email"].trim());
    if (foundUser) {
        res.status(400).send('Email is already in use');
        return;
    }
    const userID = generateRandomString();

    users[userID] = {
        id: userID,
        email: req.body.email,
        password: req.body.password
    }

    res.cookie('user_id', userID);
    res.redirect("/urls");
});

app.get('/login', (req, res) => {
    const templateVars = { user: req.cookies["user_id"] };
    res.render('login', templateVars);
});


app.get('/urls', (req, res) => {
    const templateVars = { user: req.cookies["user_id"], urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
    const templateVars = { user: req.cookies["user_id"] }
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { user: req.cookies["user_id"], id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    const data = req.body.longURL;
    const id = generateRandomString();
    urlDatabase[id] = data;
    res.redirect(`/u/${id}`);
});

app.get("/u/:id", (req, res) => {
    const templateVars = { user: req.cookies["user_id"], id: req.params.id, longURL: urlDatabase[req.params.id] };
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
    const email = req.body.email;
    res.cookie('email', email);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    const email = req.body.email;
    res.clearCookie('email', email);
    res.redirect("/urls");
});

app.get("/register", (req, res) => {
    templateVars = { user: req.cookies["user_id"] };
    res.render("register", templateVars);
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

const getUserByEmail = (email) => {
    for (const userID in users) {
        if (users[userID].email === email) {
            return users[userID];
        }
    }
};