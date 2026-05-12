const { connectToDatabase } = require('../database');

class userReviewModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }
  }

  create(review_id, user_id){
    const query = "INSERT INTO UserReview (review_id, user_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id, user_id);

    return {review_id, user_id};
  }

  getById(review_id){
    const query = "SELECT * FROM UserReview WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(review_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM UserReview';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(review_id, user_id){
    const query = "UPDATE UserReview SET user_id = ? WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, review_id);

    return this.getById(review_id);
  }

  delete(review_id){
    const query = "DELETE FROM UserReview WHERE review_id = ?";

    const old_info = this.getById(review_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id);

    return old_info;
  }
}

module.exports = userReviewModel;