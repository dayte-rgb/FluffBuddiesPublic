const { connectToDatabase } = require('../database');

class userCertificationModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }
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

    const info = stmt.get(user_id, certification_id);

    return info
  }

  getAll(){
    const query = 'SELECT * FROM UserCertification';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
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