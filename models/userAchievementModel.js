const { connectToDatabase } = require('../database');

class userAchievementModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(user_id, achievement_id){
    const query = "INSERT INTO UserAchievement (user_id, achievement_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, achievement_id);

    return {user_id, achievement_id};
  }

  getByIds(user_id, achievement_id){
    const query = "SELECT * FROM UserAchievement WHERE user_id = ? AND achievement_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, achievement_id);

    return info
  }

  getAll(){
    const query = 'SELECT * FROM UserAchievement';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(user_id, achievement_id){
    const query = "DELETE FROM UserAchievement WHERE user_id = ? AND achievement_id = ?";

    const stmt = this.db.prepare(query);

    const old_info = this.getByIds(user_id, achievement_id);

    const info = stmt.run(user_id, achievement_id);

    return old_info;
  }
}

module.exports = userAchievementModel;