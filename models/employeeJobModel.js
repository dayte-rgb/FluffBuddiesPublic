const { connectToDatabase } = require('../database');

class employeeJobModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(job_id, employee_id){
    const query = "INSERT INTO EmployeeJob (job_id, employee_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, employee_id);

    return {job_id, employee_id};
  }

  getByIds(job_id, employee_id){
    const query = "SELECT * FROM EmployeeJob WHERE job_id = ? AND employee_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id, employee_id);

    return info
  }

  getAll(){
    const query = 'SELECT * FROM EmployeeJob';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(job_id, employee_id){
    const query = "DELETE FROM EmployeeJob WHERE job_id = ? AND employee_id = ?";

    const stmt = this.db.prepare(query);

    const job_info = this.getByIds(job_id, employee_id);

    const info = stmt.run(job_id, employee_id);

    return job_info;
  }
}

module.exports = employeeJobModel;