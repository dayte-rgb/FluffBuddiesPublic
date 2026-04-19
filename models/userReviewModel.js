const { connectToDatabase } = require('../database');

class userReviewModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(review_id, user_id){
    const query = "INSERT INTO UserReview (review_id, user_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id, user_id);

    return {review_id, user_id};
  }

  retrieve(review_id){
    const query = "SELECT * FROM UserReview WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(review_id);

    return info;
  }

  update(review_id, new_user_id){
    const query = "UPDATE UserReview SET user_id = ? WHERE review_id = ?";

    const old_info = this.retrieve(review_id);

    if(new_user_id == null){
        new_user_id = old_info.user_id;
    }

    const stmt = this.db.prepare(query);

    const info = stmt.run(new_user_id, review_id);

    return this.retrieve(review_id);
  }

  delete(review_id){
    const query = "DELETE FROM UserReview WHERE review_id = ?";

    const old_info = this.retrieve(review_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id);

    return old_info;
  }
}

module.exports = userReviewModel;