const { urlDatabase } = require('./users');

const getUserByEmail = (email, database) => { //return object of user using email from database
    for (const userID in database) {
        if (database[userID].email === email) {
            return database[userID]; //returns user object
        }
    }
    return null;
};

const generateRandomString = () => { //generates random 6 digit word
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortURL = '';
    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        shortURL += charset[randomIndex];
    }
    return shortURL;
};

const urlsForUser = (id) => { // returns object of urls belonging to user_id
    const urls = {};
    for (const shortURL in urlDatabase) {
        if (urlDatabase[shortURL].userID === id) {  //if the given id exists in url database
            urls[shortURL] = urlDatabase[shortURL].longURL; //adding it's url to urls object
        }
    }
    return urls;
};

const findErrors = (user, shortURL) => { //checks for different conditions and returns an object of status code and a message
    const urls = urlsForUser(user);
    if (!urlDatabase[shortURL]) {   //if the id is not in database
        return { statusCode: 404, message: "invalid url" };
    }
    if (!user) {   //if the user is not logged in
        return { statusCode: 404, message: "invalid url" };
    }
    if (!(shortURL in urls)) { //if the short URL do not belong to the user
        return { statusCode: 403, message: "user do not own the URL" };
    }

};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, findErrors };