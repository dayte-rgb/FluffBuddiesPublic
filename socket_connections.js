const userMap = new Map();


function registerUser(userId, socket){
    userMap.set(String(userId), socket);
};

function removeUser(userId){
    userMap.delete(String(userId));
};

function getSocket(userId){
    return userMap.get(String(userId));
};

//when exporting functions, surround in brackets and do not include parenthesis
module.exports = {registerUser, removeUser, getSocket};