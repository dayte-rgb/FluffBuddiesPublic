const { connectToDatabase } = require('../database');

class jobCategoryModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(job_category_id, category_name){
    const query = "INSERT INTO JobCategory (job_category_id, category_name) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(job_category_id, category_name);

    return {job_category_id, category_name};
  }

  retrieve(job_category_id){
    const query = "SELECT * FROM JobCategory WHERE job_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_category_id);

    return info;
  }

  update(job_category_id, category_name){
    const query = "UPDATE JobCategory SET category_name = ? WHERE job_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(category_name, job_category_id);

    return this.retrieve(job_category_id);
  }

  delete(job_category_id){
    const query = "DELETE FROM JobCategory WHERE job_category_id = ?";

    const deleted_info = retrieve(job_category_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_category_id);

    return deleted_info;
  }
}

module.exports = jobCategoryModel;