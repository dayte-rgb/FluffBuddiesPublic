const { connectToDatabase } = require('../database');

class paymentContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(payment_name){
    const query = "INSERT INTO PaymentContent (payment_id, payment_name) VALUES (NULL, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(payment_name);

    return {id: info.lastInsertRowid, payment_name};
  }

  getById(payment_id){
    const query = "SELECT * FROM PaymentContent WHERE payment_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(payment_id);

    return info;
  }

  getByName(payment_name){
    const query = "SELECT * FROM PaymentContent WHERE payment_name = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(payment_name);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM PaymentContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(payment_id, payment_name){
    const query = "UPDATE PaymentContent SET payment_name = ? WHERE payment_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(payment_name, payment_id);

    return this.getById(payment_id);
  }

  delete(payment_id){
    const query = "DELETE FROM PaymentContent WHERE payment_id = ?";

    const deleted_info = this.getById(payment_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(payment_id);

    return deleted_info;
  }
}

module.exports = paymentContentModel;