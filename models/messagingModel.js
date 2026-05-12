const {connectToDatabase } = require('../database');

class MessagingModel {
    constructor(db = undefined) {
        if(db == undefined){
            this.db = connectToDatabase();
        }else{
            this.db = db; //store the db connection
        }

        this.historyQuery = this.db.prepare(`
            SELECT msg.message_id, msg.message_content, msg.datetime, um.sender_id, um.recipient_id
            FROM MessageContent msg
            JOIN UserMessage um ON msg.message_id = um.message_id
            WHERE (um.sender_id = ? AND um.recipient_id = ?) OR (um.sender_id = ? AND um.recipient_id = ?)
            ORDER BY msg.datetime ASC;
        `);
        
        // find where the user has been both the sender and recipient and union
        // this represents all conversations the user has been in
        this.conversationQuery = this.db.prepare(`
            SELECT DISTINCT um.recipient_id AS contact_id, u.username AS contact_username
            FROM UserMessage um
            JOIN User u ON um.recipient_id = u.user_id
            WHERE um.sender_id = ?
            UNION
            SELECT DISTINCT sender_id AS contact_id, u.username AS contact_username
            FROM UserMessage um
            JOIN User u ON um.sender_id = u.user_id
            WHERE um.recipient_id = ?;
        `);
    }

    getHistory(user1_id, user2_id){
        return this.historyQuery.all(user1_id, user2_id, user2_id, user1_id);
    }
    
    getConversationIds(user_id){
        return this.conversationQuery.all(user_id, user_id);
    }
}

module.exports = MessagingModel;