const { connectToDatabase } = require('../database');

class messageContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(message_content){
    const query = "INSERT INTO MessageContent (message_id, message_content, datetime) VALUES (NULL, ?, datetime('now', 'localtime'))";

    const stmt = this.db.prepare(query);

    const info = stmt.run(message_content);

    return this.getById(info.lastInsertRowid);
  }

  getById(message_id){
    const query = "SELECT * FROM MessageContent WHERE message_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(message_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM MessageContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

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