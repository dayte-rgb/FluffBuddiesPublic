const { connectToDatabase } = require('../database');

class skillCategoryModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(skill_category_id, category_name){
    const query = "INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(skill_category_id, category_name);

    return {skill_category_id, category_name};
  }

  retrieve(skill_category_id){
    const query = "SELECT * FROM SkillCategory WHERE skill_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(skill_category_id);

    return info;
  }

  update(skill_category_id, category_name){
    const query = "UPDATE SkillCategory SET category_name = ? WHERE skill_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(category_name, skill_category_id);

    return this.retrieve(skill_category_id);
  }

  delete(skill_category_id){
    const query = "DELETE FROM SkillCategory WHERE skill_category_id = ?";

    const deleted_info = retrieve(skill_category_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(skill_category_id);

    return deleted_info;
  }
}

module.exports = skillCategoryModel;