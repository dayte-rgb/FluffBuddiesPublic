const { connectToDatabase } = require('../database');

class userCertificationModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(user_id, certification_id){
    const query = "INSERT INTO UserCertification (user_id, certification_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, certification_id);

    return {user_id, certification_id};
  }

  getByIds(user_id, certification_id){
    const query = "SELECT * FROM UserCertification WHERE user_id = ? AND certification_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, certification_id);

    return info
  }

  delete(user_id, certification_id){
    const query = "DELETE FROM UserCertification WHERE user_id = ? AND certification_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getByIds(user_id, certification_id);

    const info = stmt.run(user_id, certification_id);

    return old_info;
  }
}

module.exports = userCertificationModel;