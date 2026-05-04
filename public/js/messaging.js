const status = document.getElementById('status');
let messageInput = document.getElementById('messageInput');
let convInput = document.getElementById('newConversationInput');
const sendButton = document.getElementById('send');
const convButton = document.getElementById('newConversationButton');
const getHistoryButton = document.getElementById('getHistory');
const textBox = document.getElementById('messages');
const idBox = document.getElementById('history');
let messageId = 0;
let toUserId;
let toUsername;
const userId = document.body.dataset.userId;


// Connect to the WebSocket server
const ws = new WebSocket('ws://localhost:3000');

// Connection opened
ws.onopen = () => {
    ws.send(JSON.stringify({type: 'JOIN', userId: userId}));
    ws.send(JSON.stringify({type: 'GET_CONV_IDS', userId: userId}));
    status.textContent = 'Connected to server';
    status.style.color = 'green';
};

sendButton.addEventListener('click', () =>{ 
    sendMessage();
});

convButton.addEventListener('click', () => { 
    startConversation();
});

// Send message on Enter key
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Send message on Enter key
convInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startConversation();
    }
});

// listen for messages
ws.onmessage = (event) => {
    const {type, ...payload} = JSON.parse(event.data);

    switch(type){
        case 'NEW_MESSAGE':{
            const {content, datetime} = payload;
            displayMsg(content, datetime);
            break;
        }
        case 'HISTORY_RET': {
            const {history, userId} = payload;
            displayHistory(history, userId);
        }
        case 'RET_CONV_IDS': {
            const {userId, ids} = payload;
            displayConvIds(userId, ids);
        }
        case 'RET_USER_ID': {
            //if it can't find the id, will return undefined, which throws an error, which we catch and set toUserId as undefined
            const {userId} = payload;
            toUserId = userId;
            break;
        }
        default: {
            console.log("oh no!");
        }
    };
};

// Handle errors
ws.onerror = (error) => {
    status.textContent = 'Error: ' + error.message;
    status.style.color = 'red';
};

// Handle connection close
ws.onclose = () => {
    status.textContent = 'Disconnected from server';
    status.style.color = 'red';
};

async function startConversation(){
    const convInput = document.getElementById('newConversationInput');
    const newUsername = convInput.value;

    ws.send(JSON.stringify({type: "GET_USER_ID", username: newUsername}));

    // this is jank, but we wait 500ms to give the server enough time to return a response for toUserId, otherwise toUserId will be the wrong value
    // then we pray to God that it arrives in time :D
    await new Promise(resolve => setTimeout(resolve, 500));

    // check that if a user inputted a non-existant user or themselves, fails to create a conversation
    if(!toUserId || toUserId == userId){
        convInput.value = "";
        convInput.placeholder = "Please input a valid username"
        return;
    }

    const newUserId = toUserId;
    toUsername = newUsername;

    convInput.value = "";

    //add user to list of users to choose from
    addUserButton(userId, newUserId);
}

// Function to send a message
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();

    //check to make sure toUserId is defined
    if(!toUserId){
        return;
    }

    // send to WebSockets
    console.log(userId, toUserId, message);
    if (message) {
        ws.send(JSON.stringify({type: 'SEND_MESSAGE', userId: userId, toUserId: toUserId, content: message}));
        messageInput.value = '';
    };

    displayMsg(message, new Date().toLocaleString('en-CA', { hour12: false }).replace(",", ""));
};

function getChatHistory(userId, toUserId){
    ws.send(JSON.stringify({type: 'HISTORY', userId: userId, toUserId: toUserId}));
};

function displayMsg(msg, datetime){
    // create the text box and add to the DOM
    const textElement = document.createElement('p');

    textElement.id = `historyText${messageId}`;
    messageId += 1;
    textElement.textContent = `[${datetime}] You: ${msg}`;
    
    textBox.append(textElement);
    textBox.scrollTop = textBox.scrollHeight;
}

function displayHistory(history, userId){
    for(let i = 0; i < history.length; i++){
        const textElement = document.createElement('p');
        textElement.id = `historyText${messageId}`;

        if(history[i].sender_id == userId){
            textElement.textContent = `[${history[i].datetime}] You: ${history[i].message_content}`;
        }else{
            textElement.textContent = `[${history[i].datetime}] Recipient: ${history[i].message_content}`;
        };
        messageId += 1;
        
        textBox.append(textElement);
    };
}

function displayConvIds(userId, ids){
    for(let i = 0; i < ids.length; i++){
        const button = document.createElement('button');

        button.addEventListener('click', () => {
            toUserId = ids[i].contact_id;
            removeChatHistory();
            getChatHistory(userId, ids[i].contact_id);
        });

        button.width = 200;
        button.height = 50;
        button.textContent = `${ids[i].contact_username}`;

        idBox.append(button);
    }
}

function addUserButton(userId, toUserId){
    const button = document.createElement('button');

    button.addEventListener('click', () => {
        removeChatHistory();
        getChatHistory(userId, toUserId);
    });

    button.width = 200;
    button.height = 50;
    button.textContent = `${toUsername}`;

    idBox.append(button);
}

function removeChatHistory(){
    textBox.innerHTML = "";
};
