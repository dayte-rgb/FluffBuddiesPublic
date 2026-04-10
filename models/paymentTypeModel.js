const { connectToDatabase } = require('../database');

class paymentTypeModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(payment_id, payment_name){
    const query = "INSERT INTO PaymentType (payment_id, payment_name) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(payment_id, payment_name);

    return {payment_id, payment_name};
  }

  retrieve(payment_id){
    const query = "SELECT * FROM PaymentType WHERE payment_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(payment_id);

    return info;
  }

  update(payment_id, payment_name){
    const query = "UPDATE PaymentType SET payment_name = ? WHERE payment_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(payment_name, payment_id);

    return this.retrieve(payment_id);
  }

  delete(payment_id){
    const query = "DELETE FROM PaymentType WHERE payment_id = ?";

    const deleted_info = retrieve(payment_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(payment_id);

    return deleted_info;
  }
}

module.exports = paymentTypeModel;