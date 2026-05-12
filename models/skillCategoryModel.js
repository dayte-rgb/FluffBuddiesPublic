const { connectToDatabase } = require('../database');

class skillCategoryModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }
  }

  create(category_name){
    const query = "INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (NULL, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(category_name);

    return {id: info.lastInsertRowid, category_name};
  }

  getById(skill_category_id){
    const query = "SELECT * FROM SkillCategory WHERE skill_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(skill_category_id);

    return info;
  }

  getByName(category_name){
    const query = "SELECT * FROM SkillCategory WHERE category_name = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(category_name);

    return info;
  }

  getAll(){
    const query = "SELECT * FROM SkillCategory";

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(skill_category_id, category_name){
    const query = "UPDATE SkillCategory SET category_name = ? WHERE skill_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(category_name, skill_category_id);

    return this.getById(skill_category_id);
  }

  delete(skill_category_id){
    const query = "DELETE FROM SkillCategory WHERE skill_category_id = ?";

    const deleted_info = this.getById(skill_category_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(skill_category_id);

    return deleted_info;
  }
}

module.exports = skillCategoryModel;