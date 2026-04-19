const { connectToDatabase } = require('../database');

class skillCategoryByUserModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(user_id, skill_category_id){
    const query = "INSERT INTO SkillCategoryByUser (user_id, skill_category_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(user_id, skill_category_id);

    return {user_id, skill_category_id};
  }

  getByIds(user_id, skill_category_id){
    const query = "SELECT * FROM SkillCategoryByUser WHERE user_id = ? AND skill_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(user_id, skill_category_id);

    return info;
  }

  delete(user_id, skill_category_id){
    const query = "DELETE FROM SkillCategoryByUser WHERE user_id = ? AND skill_category_id = ?";

    const deleted_info = this.getByIds(user_id, skill_category_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, skill_category_id);

    return deleted_info;
  }
}

module.exports = skillCategoryByUserModel;