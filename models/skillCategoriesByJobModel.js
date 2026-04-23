const { connectToDatabase } = require('../database');

class skillCategoriesByJobModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(job_id, skill_category_id){
    const query = "INSERT INTO SkillCategoriesByJob (job_id, skill_category_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, skill_category_id);

    return {job_id, skill_category_id};
  }

  getByIds(job_id, skill_category_id){
    const query = "SELECT * FROM SkillCategoriesByJob WHERE job_id = ? AND skill_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_id, skill_category_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM SkillCategoriesByJob';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(job_id, skill_category_id){
    const query = "DELETE FROM SkillCategoriesByJob WHERE job_id = ? AND skill_category_id = ?";

    const deleted_info = this.getByIds(job_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_id, skill_category_id);

    return deleted_info;
  }
}

module.exports = skillCategoriesByJobModel;