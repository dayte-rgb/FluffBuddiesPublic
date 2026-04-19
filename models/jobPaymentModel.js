const { connectToDatabase } = require('../database');

class jobPaymentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(job_id, payment_id, payment_quantity){
    const query = "INSERT INTO JobPayment (job_id, payment_id, payment_quantity) VALUES (?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(job_id, payment_id, payment_quantity);

    return {job_id, payment_id, payment_quantity};
  }

  getById(job_id){
    const query = "SELECT * FROM JobPayment WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM JobPayment';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(job_id, payment_id, payment_quantity){
    const query = "UPDATE JobPayment SET payment_id = ?, payment_quantity = ? WHERE job_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(payment_id, job_id, payment_quantity);

    return this.getById(job_id);
  }

  delete(job_id){
    const query = "DELETE FROM JobPayment WHERE job_id = ?";

    const deleted_info = this.getById(job_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id);

    return deleted_info;
  }
}

module.exports = jobPaymentModel;