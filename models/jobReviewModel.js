const { connectToDatabase } = require('../database');

class jobReviewModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(review_id, job_id){
    const query = "INSERT INTO JobReview (review_id, job_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id, job_id);

    return {review_id, job_id};
  }

  getById(review_id){
    const query = "SELECT * FROM JobReview WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(review_id);

    return info;
  }

  getByJobId(job_id){
    const query = "SELECT review_id FROM JobReview WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.all(job_id);

    return info;
  }

  getAllByJobId(job_id) {
    const query = "SELECT review_id FROM JobReview WHERE job_id = ?";
    const stmt = this.db.prepare(query);
    return stmt.all(job_id);
  }
  
  getAll(){
    const query = 'SELECT * FROM JobReview';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(review_id, job_id){
    const query = "UPDATE JobReview SET job_id = ? WHERE review_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, review_id);

    return this.getById(review_id);
  }

  delete(review_id){
    const query = "DELETE FROM JobReview WHERE review_id = ?";

    const deleted_info = this.getById(review_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(review_id);

    return deleted_info;
  }
}

module.exports = jobReviewModel;