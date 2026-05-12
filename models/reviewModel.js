const { connectToDatabase } = require('../database');

class reviewModel {
  constructor(db) {
    this.db = db || connectToDatabase();

    this._getReviews = this.db.prepare(`
        SELECT u.username, jr.review_id, rc.punctuality, rc.quality, rc.friendliness, rc.comments, rc.datetime, rc.verified
        FROM JobReview jr
        JOIN ReviewContent rc ON jr.review_id = rc.review_id
        JOIN UserReview ur ON jr.review_id = ur.review_id
        JOIN User u ON ur.user_id = u.user_id
        WHERE jr.job_id = ?;
    `);
  }

  getReviewsByJobId(job_id){
    return this._getReviews.all(job_id);
  }
}

module.exports = reviewModel;