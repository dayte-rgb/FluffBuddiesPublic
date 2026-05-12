const { connectToDatabase } = require('../database');

class employerJobModel {
  constructor(db = undefined) {
      if(db == undefined){
        this.db = connectToDatabase();
      }else{
        this.db = db; //store the db connection
      }
    }

  create(job_id, employer_id){
    const query = "INSERT INTO EmployerJob (job_id, employer_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, employer_id);

    return {job_id, employer_id};
  }

  getById(job_id){
    const query = "SELECT * FROM EmployerJob WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id);

    return info;
  }

  getJobsByEmployerId(employer_id) {
    const query = `
      SELECT jc.*, em.employer_id
      FROM EmployerJob em
      JOIN JobContent jc ON em.job_id = jc.job_id
      WHERE em.employer_id = ?
      ORDER BY jc.datetime ASC
    `;

    const stmt = this.db.prepare(query);
    return stmt.all(employer_id);
  }

  getAll(){
    const query = 'SELECT * FROM EmployerJob';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(job_id, employer_id){
    const query = "UPDATE EmployerJob SET employer_id = ? WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(employer_id, job_id);

    return this.getById(job_id);
  }

  delete(job_id){
    const query = "DELETE FROM EmployerJob WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const job_info = this.getById(job_id);

    const info = stmt.run(job_id);

    return job_info;
  }
}

module.exports = employerJobModel;