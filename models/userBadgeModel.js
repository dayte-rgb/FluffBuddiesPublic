const { connectToDatabase } = require('../database');

class userBadgeModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(user_id, badge_id){
    const query = "INSERT INTO UserBadge (user_id, badge_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, badge_id);

    return {user_id, badge_id};
  }

  getByIds(user_id, badge_id){
    const query = "SELECT * FROM UserBadge WHERE user_id = ? AND badge_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, badge_id);

    return info
  }

  getAll(){
    const query = 'SELECT * FROM UserBadge';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(user_id, badge_id){
    const query = "DELETE FROM UserBadge WHERE user_id = ? AND badge_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getByIds(user_id, badge_id);

    const info = stmt.run(user_id, badge_id);

    return old_info;
  }
}

module.exports = userBadgeModel;