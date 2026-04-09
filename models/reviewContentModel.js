const { connectToDatabase } = require('../database');

class employeeJobModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(punctuality, quality, friendliness, comments, datetime, verified){
    const query = "INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (NULL, ?, ?, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(punctuality, quality, friendliness, comments, datetime, verified);

    return {id: info.lastInsertRowid, punctuality, quality, friendliness, comments, datetime, verified};
  }

  retrieve(review_id){
    const query = "SELECT * FROM ReviewContent WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(review_id);

    return info;
  }

  update(review_id, punctuality, quality, friendliness, comments, datetime, verified){
    const query = "UPDATE ReviewContent SET punctuality = ?, quality = ?, friendlines = ?, comments = ?, datetime = ?, verified = ? WHERE review_id = ?";

    const old_info = retrieve(review_id);

    if(punctuality == null){
        punctuality = old_info.punctuality;
    }
    
    if(quality == null){
        quality = old_info.quality;
    }

    if(friendliness == null){
        friendliness = old_info.friendliness;
    }

    if(comments == null){
        comments = old_info.comments;
    }

    if(datetime == null){
        datetime = old_info.datetime;
    }

    if(verified == null){
        verified = old_info.verified;
    }

    const stmt = this.db.prepare(query);

    const info = stmt.run(punctuality, quality, friendliness, comments, datetime, verified, review_id);

    return this.retrieve(review_id);
  }

  delete(review_id){
    const query = "DELETE FROM ReviewContent WHERE review_id = ?";

    const old_info = this.retrieve(review_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id);

    return old_info;
  }
}