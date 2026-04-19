const { connectToDatabase } = require('../database');

class messageContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(message_content, datetime){
    const query = "INSERT INTO MessageContent (message_id, message_content, datetime) VALUES (NULL, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(message_content, datetime);

    return {id: info.lastInsertRowid, message_content, datetime};
  }

  getById(message_id){
    const query = "SELECT * FROM MessageContent WHERE message_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(message_id);

    return info;
  }

  update(message_id, message_content, datetime){
    const query = "UPDATE MessageContent SET message_content = ?, datetime = ? WHERE message_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(message_content, message_id, datetime);

    return this.getById(message_id);
  }

  delete(message_id){
    const query = "DELETE FROM MessageContent WHERE message_id = ?";

    const deleted_info = this.getById(message_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(message_id);

    return deleted_info;
  }
}

module.exports = messageContentModel;