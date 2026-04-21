const { connectToDatabase } = require('../database');

class jobContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(description, datetime, duration, zipcode, employee_num, job_filled){
    const query = "INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled) VALUES (NULL, ?, ?, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(description, datetime, duration, zipcode, employee_num, job_filled);

    return { id: info.lastInsertRowid, description, datetime, duration, zipcode, employee_num, job_filled};
  }

  getById(job_id){
    const query = "SELECT * FROM JobContent WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM JobContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(job_id, description, datetime, duration, zipcode, employee_num, job_filled){
    const query = "UPDATE JobContent SET description = ?, datetime = ?, duration = ?, zipcode = ?, employee_num = ?, job_filled = ? WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(description, datetime, duration, zipcode, employee_num, job_filled, job_id);

    return this.getById(job_id);
  }

  delete(job_id){
    const deleted_job_info = this.getById(job_id);

    const query = 'DELETE FROM JobContent WHERE job_id = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id);

    return deleted_job_info;
  }
}
module.exports = jobContentModel;