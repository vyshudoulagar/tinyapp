const { urlDatabase } = require('./users');

const getUserByEmail = (email, database) => {
    for (const userID in database) {
        if (database[userID].email === email) {
            return database[userID]; //returns user object
        }
    }
    return null;
};

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
        if (urlDatabase[shortURL].userID === id) {  //if the given id exists in url database
            urls[shortURL] = urlDatabase[shortURL].longURL; //adding it's url to urls object
        }
    }
    return urls;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };