const express = require('express');
const cookieParser = require('cookie-parser')
const bcrypt = require("bcryptjs");

const app = express();

app.use(cookieParser()); //to use cookies from requests

const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const users = {  //users database
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
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW",
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW",
    },
};

// const urlDatabase = { //urls database
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com"
// };

app.use(express.urlencoded({ extended: true })); //middleware to parse request bodies

app.get("/register", (req, res) => {
    const user = req.cookies.user_id;
    if (user) {   //if the user is already logged in
        return res.redirect("/urls");
    }
    const templateVars = { user: null }; //as there is no user id before we register
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    if (req.body.email.trim() === '' || req.body.password.trim() === '') { //check if the user typed email and pw
        res.status(400).send('Email or password cannot be empty'); //throw an error if the user did not fill email or pw
        return;
    }

    const foundUser = getUserByEmail(req.body.email.trim()); //using trim to ignore blankspaces on the ends
    if (foundUser) {   //if the email is found in users database
        res.status(400).send('Email is already in use');
        return;
    }
    const userID = generateRandomString();  //generating random string for userID

    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10); //hashing the password

    users[userID] = { //assigning registered values to users database
        id: userID,
        email: req.body.email,
        password: hashedPassword //storing the hashed password
    }

    res.cookie('user_id', userID); //assigning a cookie for user id
    res.redirect("/urls");
});

app.get('/login', (req, res) => {
    const user = req.cookies.user_id;
    if (user) {       //if the user is already logged in
        return res.redirect("/urls");
    }
    const templateVars = { user: null };  //as there is no user id before we login
    res.render('login', templateVars);
});

app.post("/login", (req, res) => {
    const foundUser = getUserByEmail(req.body.email.trim()); //checking if the email is valid
    if (!foundUser || !bcrypt.compareSync(req.body.password, foundUser.password)) { //if the user is not found with the email in users database or hashed password did not match
        res.status(403).send('Invalid login');
    } else {
        res.cookie('user_id', foundUser.id); //assigning a cookie for user id
        res.redirect("/urls");
    }
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id'); //clearing the cookie user id
    res.redirect("/login");
});

app.get('/urls', (req, res) => {
    const user = req.cookies.user_id;
    if (!user) {   //if the user is not logged in
        return res.send("user is not logged in");
    }
    const templateVars = { user: users[req.cookies.user_id], urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
    const user = req.cookies.user_id;
    if (!user) {   //if the user is not logged in
        return res.redirect("/login");
    }
    const templateVars = { user: users[user] }
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const user = req.cookies.user_id;
    const id = req.params.id;
    const urls = urlsForUser(user);
    console.log(id);
    if (!urlDatabase[id]) {   //if the id is not in database
        return res.send("invalid url");
    }
    if (!user) {   //if the user is not logged in
        return res.send("user is not logged in");
    }
    if (id in urls) {  //if the user_id do not match url's user id
        const templateVars = { user: users[user], id: id, longURL: urlDatabase[id].longURL };
        res.render("urls_show", templateVars);
        return
    }
    res.send("user do not own the URL");
});

app.post("/urls", (req, res) => {
    const user = req.cookies.user_id;
    if (!user) {   //if the user is not logged in
        return res.send("user is not logged in");
    }
    const data = { longURL: req.body.longURL, userID: user };
    const id = generateRandomString();
    urlDatabase[id] = data;
    res.redirect(`/u/${id}`);
});

app.get("/u/:id", (req, res) => {
    const shortURL = req.params.id;
    for (const id in urlDatabase) {
        if (shortURL === id) {  //if the short url is valid
            let longURL = urlDatabase[id].longURL;
            res.redirect(longURL);
            return;
        }
    }
    return res.send("Invalid short url");
});

app.post("/urls/:id/delete", (req, res) => {
    const user = req.cookies.user_id;
    const id = req.params.id;
    const urls = urlsForUser(user);
    if (!urlDatabase[id]) {   //if the id is not in database
        return res.send("invalid url");
    }
    if (!user) {   //if the user is not logged in
        return res.send("user is not logged in");
    }
    if (id in urls) {
        delete urlDatabase[id];
        res.redirect('/urls');
        return;
    }
    res.send("user do not own the URL");
});

app.post("/urls/:id", (req, res) => {
    const longURL = req.body.longURL;
    const id = req.params.id;
    urlDatabase[id].longURL = longURL;
    res.redirect(`/urls/${id}`);
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

const urlsForUser = (id) => {
    const urls = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === id) {
            urls[shortURL] = urlDatabase[shortURL].longURL;
        }
    }
    return urls;
};