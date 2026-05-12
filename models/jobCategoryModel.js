const { connectToDatabase } = require('../database');

class jobCategoryModel {
  constructor(db = undefined) {
      if(db == undefined){
        this.db = connectToDatabase();
      }else{
        this.db = db; //store the db connection
      }
    }

  create(category_name){
    const query = "INSERT INTO JobCategory (job_category_id, category_name) VALUES (NULL, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(category_name);

    return {id: info.lastInsertRowid, category_name};
  }

  getById(job_category_id){
    const query = "SELECT * FROM JobCategory WHERE job_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(job_category_id);

    return info;
  }

  getByName(category_name){
    const query = "SELECT * FROM JobCategory WHERE category_name = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(category_name);

    return info;
  }

  getAll(){
    const query = "SELECT * FROM JobCategory";

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(job_category_id, category_name){
    const query = "UPDATE JobCategory SET category_name = ? WHERE job_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(category_name, job_category_id);

    return this.getById(job_category_id);
  }

  delete(job_category_id){
    const query = "DELETE FROM JobCategory WHERE job_category_id = ?";

    const deleted_info = this.getById(job_category_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(job_category_id);

    return deleted_info;
  }
}

module.exports = jobCategoryModel;