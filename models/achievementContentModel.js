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

  retrieve(achievement_id){
    const query = "SELECT * FROM AchievementContent WHERE achievement_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(achievement_id);

    return info;
  }

  update(achievement_id, achievement_name, metric_id, badge_id, required_quantity){
    const query = "UPDATE AchievementContent SET achievement_name = ?, metric_id = ?, badge_id = ?, required_quantity = ? WHERE achievement_id = ?";

    const old_info = this.retrieve(achievement_id);

    if(achievement_name == null){
        achievement_name = old_info.achievement_name;
    }
    
    if(metric_id == null){
        metric_id = old_info.metric_id;
    }

    if(badge_id == null){
        badge_id = old_info.badge_id;
    }

    if(required_quantity == null){
        required_quantity = old_info.required_quantity;
    }

    const stmt = this.db.prepare(query);

    const info = stmt.run(achievement_name, metric_id, badge_id, required_quantity, achievement_id);

    return this.retrieve(achievement_id);
  }

  delete(achievement_id){
    const query = "DELETE FROM AchievementContent WHERE achievement_id = ?";

    const old_info = this.retrieve(achievement_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(achievement_id);

    return old_info;
  }
}

module.exports = achievementContentModel;