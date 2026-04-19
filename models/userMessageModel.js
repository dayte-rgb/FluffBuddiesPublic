const { connectToDatabase } = require('../database');

class userMessageModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(message_id, sender_id, recipient_id){
    const query = "INSERT INTO UserMessage (message_id, sender_id, recipient_id) VALUES (?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(message_id, sender_id, recipient_id);

    return {message_id, sender_id, recipient_id};
  }

  retrieve(message_id){
    const query = "SELECT * FROM UserMessage WHERE message_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(message_id);

    return info;
  }

  update(message_id, sender_id, recipient_id){
    const query = "UPDATE UserMessage SET sender_id = ?, recipient_id = ? WHERE message_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(sender_id, message_id, recipient_id);

    return this.retrieve(message_id);
  }

  delete(message_id){
    const query = "DELETE FROM UserMessage WHERE message_id = ?";

    const deleted_info = retrieve(message_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(message_id);

    return deleted_info;
  }
}

module.exports = userMessageModel;