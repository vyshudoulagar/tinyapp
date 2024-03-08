const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers');

const app = express();

app.use(express.urlencoded({ extended: false })); //middleware to parse request bodies
app.use(express.json());
app.use(cookieSession({ //to encrypt the cookies
    name: 'session',
    keys: ['key1', 'key2']
}))

const PORT = 8080; //default port 8080

app.set('view engine', 'ejs');

const users = {  //users database
    userRandomID: {
        id: "userRandomID",
        email: "user@example.com",
        password: bcrypt.hashSync("purple-monkey-dinosaur", 10),
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: bcrypt.hashSync("dishwasher-funk", 10),
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
    b2xVn2: {
        longURL: "https://www.example.com",
        userID: "userRandomID"
    }
};

app.get("/register", (req, res) => {
    const user = req.session.user_id; //Accessing session value
    if (user) {   //if the user is already logged in
        return res.redirect("/urls");
    }
    const templateVars = { user: null }; //as there is no user id before we register
    res.render("register", templateVars);
});

app.post("/register", (req, res) => {
    const email = req.body.email.trim();
    const password = req.body.password;
    if (email === '' || password === '') { //check if the user typed email and pw
        res.status(400).send('Email or password cannot be empty'); //throw an error if the user did not fill email or pw
        return;
    }

    const foundUser = getUserByEmail(email, users); //using trim to ignore blankspaces on the ends
    if (foundUser) {   //if the email is found in users database
        res.status(400).send('Email is already in use');
        return;
    }
    const userID = generateRandomString();  //generating random string for userID

    const hashedPassword = bcrypt.hashSync(password, 10); //hashing the password

    users[userID] = { //assigning registered values to users database
        id: userID,
        email: req.body.email,
        password: hashedPassword //storing the hashed password
    }

    req.session.user_id = userID;; //assigning a cookie for user id
    res.redirect("/urls");
});

app.get('/login', (req, res) => {
    const user = req.session.user_id;
    if (user) {       //if the user is already logged in
        return res.redirect("/urls");
    }
    const templateVars = { user: null };  //as there is no user id before we login
    res.render('login', templateVars);
});

app.post("/login", (req, res) => {
    const foundUser = getUserByEmail(req.body.email.trim(), users); //checking if the email is valid
    if (!foundUser || !bcrypt.compareSync(req.body.password, foundUser.password)) { //if the user is not found with the email in users database or hashed password did not match
        res.status(403).send('Invalid login');
    } else {
        req.session.user_id = foundUser.id; //assigning a cookie for user id
        res.redirect("/urls");
    }
});

app.post("/logout", (req, res) => {
    req.session = null; //clearing the cookie user id
    res.redirect("/login");
});

app.get('/urls', (req, res) => {
    const user = req.session.user_id;
    if (!user) {   //if the user is not logged in
        return res.redirect("/login");
    }
    const templateVars = { user: users[user], urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
    const user = req.session.user_id;
    if (!user) {   //if the user is not logged in
        return res.redirect("/login");
    }
    const templateVars = { user: users[user] }
    res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
    const user = req.session.user_id;
    const shortURL = req.params.id;
    const urls = urlsForUser(user);

    if (!urlDatabase[shortURL]) {   //if the id is not in database
        return res.status(404).send("invalid url");
    }
    if (!user) {   //if the user is not logged in
        return res.status(401).send('User is not logged in');
    }
    if (shortURL in urls) {  //if the user_id do not match url's user id
        const templateVars = { user: users[user], id: shortURL, longURL: urlDatabase[shortURL].longURL };
        res.render("urls_show", templateVars);
        return
    }
    res.status(403).send("user do not own the URL");
});

app.post("/urls", (req, res) => {
    const user = req.session.user_id;
    if (!user) {   //if the user is not logged in
        return res.status(401).send('User is not logged in');
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
            let longURL = urlDatabase[shortURL].longURL;
            res.redirect(longURL);
            return;
        }
    }
    return res.status(404).send("Invalid short url");
});

app.post("/urls/:id/delete", (req, res) => {
    const user = req.session.user_id;
    const shortURL = req.params.id;
    const urls = urlsForUser(user);
    if (!urlDatabase[shortURL]) {   //if the id is not in database
        return res.status(404).send("invalid url");
    }
    if (!user) {   //if the user is not logged in
        return res.status(401).send('User is not logged in');
    }
    if (shortURL in urls) {
        delete urlDatabase[shortURL];
        res.redirect('/urls');
        return;
    }
    res.status(403).send("user do not own the URL");
});

app.post("/urls/:id", (req, res) => {
    const longURL = req.body.longURL;
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(`/urls/${shortURL}`);
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

const urlsForUser = (id) => {
    const urls = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === id) {
            urls[shortURL] = urlDatabase[shortURL].longURL;
        }
    }
    return urls;
};