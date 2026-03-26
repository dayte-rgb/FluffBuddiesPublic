const { connectToDatabase } = require('../database');

class employerJobModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(job_id, employer_id){
    const query = "INSERT INTO EmployerJob (job_id, employer_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, employer_id);

    return {job_id, employer_id};
  }

  retrieve(job_id){
    const query = "SELECT * FROM EmployerJob WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id);

    return info;
  }

  update(job_id, new_employer_id){
    const query = "UPDATE EmployerJob SET employer_id = ? WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(new_employer_id, job_id);

    return this.retrieve(job_id);
  }

  delete(job_id, employee_id){
    const query = "DELETE FROM EmployeeJob WHERE job_id = ? AND employee_id = ?";

    const stmt = this.db.prepare(query);

    const job_info = this.retrieve(job_id, employee_id);

    const info = stmt.run(job_id, employee_id);

    return job_info;
  }
}

module.exports = employerJobModel;