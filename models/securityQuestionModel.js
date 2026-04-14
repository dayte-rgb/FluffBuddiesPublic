const { connectToDatabase } = require('../database');

class securityQuestionModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(question_id, question_text){
    const query = "INSERT INTO SecurityQuestion (question_id, question_text) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(question_id, question_text);

    return {question_id, question_text};
  }

  retrieve(question_id){
    const query = "SELECT * FROM SecurityQuestion WHERE question_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(question_id);

    return info;
  }

  update(question_id, new_question_text){
    const query = "UPDATE SecurityQuestion SET question_text = ? WHERE question_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(new_question_text, question_id);

    return this.retrieve(question_id);
  }

  delete(question_id){
    const query = "DELETE FROM SecurityQuestion WHERE question_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.retrieve(question_id);

    const info = stmt.run(question_id);

    return old_info;
  }
}

module.exports = securityQuestionModel;