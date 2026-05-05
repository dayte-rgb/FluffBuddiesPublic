const userMap = new Map();


function registerUser(userId, socket){
    userMap.set(String(userId), socket);
    console.log(`[INFO] USER MAP: ${JSON.stringify(Object.fromEntries(userMap))}`);
};

function removeUser(userId){
    userMap.delete(String(userId));
};

function getSocket(userId){
    console.log(`[INFO] USER ID ${userId}`);
    console.log(`[INFO] USER MAP: ${JSON.stringify(Object.fromEntries(userMap))}`);
    console.log(`[INFO] SOCKET CONNECTIONS TO USER SOCKET: ${userMap.get(userId)}`);
    return userMap.get(String(userId));
};

//when exporting functions, surround in brackets and do not include parenthesis
module.exports = {registerUser, removeUser, getSocket};