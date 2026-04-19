const { connectToDatabase } = require('../database');

class reviewContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(punctuality, quality, friendliness, comments, datetime, verified){
    const query = "INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (NULL, ?, ?, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(punctuality, quality, friendliness, comments, datetime, verified);

    return {id: info.lastInsertRowid, punctuality, quality, friendliness, comments, datetime, verified};
  }

  getById(review_id){
    const query = "SELECT * FROM ReviewContent WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(review_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM ReviewContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(review_id, punctuality, quality, friendliness, comments, datetime, verified){
    const query = "UPDATE ReviewContent SET punctuality = ?, quality = ?, friendliness = ?, comments = ?, datetime = ?, verified = ? WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(punctuality, quality, friendliness, comments, datetime, verified, review_id);

    return this.getById(review_id);
  }

  delete(review_id){
    const query = "DELETE FROM ReviewContent WHERE review_id = ?";

    const old_info = this.getbyId(review_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id);

    return old_info;
  }
}

module.exports = reviewContentModel;