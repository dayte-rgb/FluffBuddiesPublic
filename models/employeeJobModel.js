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

  getBookingsByEmployeeId(employee_id) {
    const query = `
      SELECT jc.*, ej.employee_id, u.username AS employer_username, u.email AS employer_email
      FROM EmployeeJob ej
      JOIN JobContent jc ON ej.job_id = jc.job_id
      JOIN EmployerJob em ON em.job_id = jc.job_id
      JOIN User u ON em.employer_id = u.user_id
      WHERE ej.employee_id = ?
      ORDER BY jc.datetime ASC
    `;

    const stmt = this.db.prepare(query);
    return stmt.all(employee_id);
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