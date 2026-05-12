const { connectToDatabase } = require('../database');

class jobContentModel {
  constructor(db = undefined) {
      if(db == undefined){
        this.db = connectToDatabase();
      }else{
        this.db = db; //store the db connection
      }
    }

  create(description, datetime, duration, zipcode, employee_num, job_filled, job_completed){
    const query = "INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(description, datetime, duration, zipcode, employee_num, job_filled, job_completed);

    return { id: info.lastInsertRowid, description, datetime, duration, zipcode, employee_num, job_filled, job_completed};
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

  update(job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed){
    const query = "UPDATE JobContent SET description = ?, datetime = ?, duration = ?, zipcode = ?, employee_num = ?, job_filled = ?, job_completed = ? WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(description, datetime, duration, zipcode, employee_num, job_filled, job_completed, job_id);

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