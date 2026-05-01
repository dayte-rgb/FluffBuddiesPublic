const userMap = new Map();


function registerUser(userId, socket){
    userMap.set(userId, socket);
};

function removeUser(userId){
    userMap.delete(userId);
};

function getSocket(userId){
    return userMap.get(userId);
};

//when exporting functions, surround in brackets and do not include parenthesis
module.exports = {registerUser, removeUser, getSocket};