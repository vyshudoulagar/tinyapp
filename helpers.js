const getUserByEmail = (email, database) => {
    for (const userID in database) {
        if (database[userID].email === email) {
            return database[userID];
        }
    }
    return null;
};

module.exports = { getUserByEmail };