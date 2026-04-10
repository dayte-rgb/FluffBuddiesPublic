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

  retrieve(job_id){
    const query = "SELECT * FROM JobContent WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id);

    return info;
  }

  update(job_id, new_description = null, new_datetime = null, new_duration = null, new_zipcode = null, new_employee_num = null, new_job_filled = null){
    const query = "UPDATE JobContent SET description = ?, datetime = ?, duration = ?, zipcode = ?, employee_num = ?, job_filled = ? WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const job_info = this.retrieve(job_id);

    if(new_description == null){
        new_description = job_info.description;
    }
    
    if(new_datetime == null){
        new_datetime = job_info.datetime;
    }

    if(new_duration == null){
        new_duration = job_info.duration;
    }

    if(new_zipcode == null){
        new_zipcode = job_info.zipcode;
    }

    if(new_employee_num == null){
        new_employee_num = job_info.employee_num;
    }

    if(new_job_filled == null){
        new_job_filled= job_info.job_filled;
    }

    const info = stmt.run(new_description, new_datetime, new_duration, new_zipcode, new_employee_num, new_job_filled, job_id);

    return this.retrieve(job_id);
  }

  delete(job_id){
    const deleted_job_info = this.retrieve(job_id);

    const query = 'DELETE FROM JobContent WHERE job_id = ?';

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id);

    return deleted_job_info;
  }
}
module.exports = jobContentModel;