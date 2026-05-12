const { connectToDatabase } = require('../database');

class securityQuestionModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }
  }

  create(question_text){
    const query = "INSERT INTO SecurityQuestion (question_id, question_text) VALUES (NULL, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(question_text);

    return {id: info.lastInsertRowid, question_text};
  }

  getById(question_id){
    const query = "SELECT * FROM SecurityQuestion WHERE question_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(question_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM SecurityQuestion';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(question_id, new_question_text){
    const query = "UPDATE SecurityQuestion SET question_text = ? WHERE question_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(new_question_text, question_id);

    return this.getById(question_id);
  }

  delete(question_id){
    const query = "DELETE FROM SecurityQuestion WHERE question_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getById(question_id);

    const info = stmt.run(question_id);

    return old_info;
  }
}

module.exports = securityQuestionModel;