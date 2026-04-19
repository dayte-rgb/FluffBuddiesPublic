const { connectToDatabase } = require('../database');

class jobCategoriesByJobModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(job_id, job_category_id){
    const query = "INSERT INTO JobCategoriesByJob (job_id, job_category_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(job_id, job_category_id);

    return {job_id, job_category_id};
  }

  getByIds(job_id, job_category_id){
    const query = "SELECT * FROM JobCategoriesByJob WHERE job_id = ? AND job_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id, job_category_id);

    return info;
  }

  delete(job_id, job_category_id){
    const query = "DELETE FROM JobCategoriesByJob WHERE job_id = ? AND job_category_id = ?";

    const deleted_info = this.getByIds(job_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, job_category_id);

    return deleted_info;
  }
}

module.exports = jobCategoriesByJobModel;