const { connectToDatabase } = require('../database');

class jobCategoryByUserModel {
  constructor(db = undefined) {
      if(db == undefined){
        this.db = connectToDatabase();
      }else{
        this.db = db; //store the db connection
      }
    }

  create(user_id, job_category_id){
    const query = "INSERT INTO JobCategoryByUser (user_id, job_category_id) VALUES (?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, job_category_id);

    return {user_id, job_category_id};
  }

  getByIds(user_id, job_category_id){
    const query = "SELECT * FROM JobCategoryByUser WHERE user_id = ? AND job_category_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(user_id, job_category_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM JobCategoryByUser';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  delete(user_id, job_category_id){
    const query = "DELETE FROM JobCategoryByUser WHERE user_id = ? AND job_category_id = ?";

    const deleted_info = this.getByIds(user_id, job_category_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(user_id, job_category_id);

    return deleted_info;
  }
}

module.exports = jobCategoryByUserModel;