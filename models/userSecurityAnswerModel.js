const { connectToDatabase } = require('../database');
const bcrypt = require('bcrypt');

class userSecurityAnswerModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(user_id, question_id, answer_text){
    const query = "INSERT INTO UserSecurityAnswer (user_id, question_id, answer_text) VALUES (?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, question_id, answer_text);

    return {user_id, question_id, answer_text};
  }

  async verify(user_id, question_id, answer_text){
    const query = "SELECT answer_text FROM UserSecurityAnswer WHERE user_id = ? AND question_id = ?";

    const stmt = this.db.prepare(query);

    const row = stmt.get(user_id, question_id);

    if (row) {
      return await bcrypt.compare(answer_text, row.answer_text);
    }

    return false;
  }

  getByIds(user_id, question_id){
    const query = "SELECT * FROM UserSecurityAnswer WHERE user_id = ? AND question_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, question_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM UserSecurityAnswer';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(user_id, question_id, answer_text){
    const query = "UPDATE UserSecurityAnswer SET answer_text = ? WHERE user_id = ? AND question_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(answer_text, user_id, question_id);

    return this.getByIds(user_id, question_id);
  }

  delete(user_id, question_id){
    const query = "DELETE FROM UserSecurityAnswer WHERE user_id = ? AND question_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getByIds(user_id, question_id);

    const info = stmt.run(user_id, question_id);

    return old_info;
  }
}

module.exports = userSecurityAnswerModel;