const { connectToDatabase } = require('../database');

class achievementContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(achievement_name, metric_id, badge_id, required_quantity){
    const query = "INSERT INTO AchievementContent (achievement_id, achievement_name, metric_id, badge_id, required_quantity) VALUES (NULL, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(achievement_name, metric_id, badge_id, required_quantity);

    return {id: info.lastInsertRowid, achievement_name, metric_id, badge_id, required_quantity};
  }

  getById(achievement_id){
    const query = "SELECT * FROM AchievementContent WHERE achievement_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(achievement_id);

    return info;
  }

  getByName(achievement_name){
    const query = "SELECT * FROM AchievementContent WHERE achievement_name = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(achievement_name);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM AchievementContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(achievement_id, achievement_name, metric_id, badge_id, required_quantity){
    const query = "UPDATE AchievementContent SET achievement_name = ?, metric_id = ?, badge_id = ?, required_quantity = ? WHERE achievement_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(achievement_name, metric_id, badge_id, required_quantity, achievement_id);

    return this.getById(achievement_id);
  }

  delete(achievement_id){
    const query = "DELETE FROM AchievementContent WHERE achievement_id = ?";

    const old_info = this.getById(achievement_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(achievement_id);

    return old_info;
  }
}

module.exports = achievementContentModel;