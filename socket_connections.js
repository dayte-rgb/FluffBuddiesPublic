const userMap = new Map();
const WebSocket = require('ws');

function registerUser(userId, socket){
    if(userId == undefined){
        console.log(`[ERROR] userId ${userId} is not an integer`);
        return;
    }

    if(socket == undefined || !(socket instanceof WebSocket)){
        console.log(`[ERROR] socket is undefined or not an instance of WebSocket`);
        return;
    }

    userMap.set(String(userId), socket);
};

function removeUser(userId){
    if(userId == undefined){
        console.log(`[ERROR] userId ${userId} is not an integer`);
        return null;
    }

    if(!userMap.has(String(userId))){
        console.log(`[ERROR] userId ${userId} is not in the map and has no socket.`);
        return null;
    }

    userMap.delete(String(userId));
};

function getSocket(userId){
    if(userId == undefined){
        console.log(`[ERROR] userId ${userId} null`);
        return null;
    }

    if(!userMap.has(String(userId))){
        console.log(`[ERROR] userId ${userId} is not in the map and has no socket.`);
        return null;
    }

    return userMap.get(String(userId));
};

//when exporting functions, surround in brackets and do not include parenthesis
module.exports = {registerUser, removeUser, getSocket};