const { connectToDatabase } = require('../database');

class certificationContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(certification_name, company){
    const query = "INSERT INTO CertificationContent (certification_id, certification_name, company) VALUES (NULL, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(certification_name, company);

    return {id: info.lastInsertRowid, certification_name, company};
  }

  getById(certification_id){
    const query = "SELECT * FROM CertificationContent WHERE certification_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(certification_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM CertificationContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(certification_id, certification_name, company){
    const query = "UPDATE CertificationContent SET certification_name = ?, company = ? WHERE certification_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(certification_name, certification_id, company);

    return this.getById(certification_id);
  }

  delete(certification_id){
    const query = "DELETE FROM CertificationContent WHERE certification_id = ?";

    const deleted_info = this.getById(certification_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(certification_id);

    return deleted_info;
  }
}

module.exports = certificationContentModel;