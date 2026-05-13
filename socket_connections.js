const userMap = new Map();
const WebSocket = require('ws');

function registerUser(userId, socket){
    if(userId == undefined || !(Number.isInteger(userId))){
        console.log(`[ERROR] userId ${userId} is not an integer`);
        return null;
    }

    if(socket == undefined || !(socket instanceof WebSocket)){
        console.log(`[ERROR] socket is undefined or not an instance of WebSocket`);
        return null;
    }

    userMap.set(String(userId), socket);
};

function removeUser(userId){
    if(userId == undefined || !(Number.isInteger(userId))){
        console.log(`[ERROR] userId ${userId} is not an integer`);
        return null;
    }

    userMap.delete(String(userId));
};

function getSocket(userId){
    if(userId == undefined || !(Number.isInteger(userId))){
        console.log(`[ERROR] userId ${userId} is not an integer`);
        return null;
    }

    return userMap.get(String(userId));
};

//when exporting functions, surround in brackets and do not include parenthesis
module.exports = {registerUser, removeUser, getSocket};