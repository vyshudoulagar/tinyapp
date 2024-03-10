const bcrypt = require("bcryptjs");

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
        userID: "user2RandomID",
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "user2RandomID",
    },
    b2xVn2: {
        longURL: "https://www.example.com",
        userID: "userRandomID"
    }
};

module.exports = { users, urlDatabase };