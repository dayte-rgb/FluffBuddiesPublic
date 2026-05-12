const { connectToDatabase } = require('../database');

class badgeContentModel {
  constructor(db = undefined) {
      if(db == undefined){
        this.db = connectToDatabase();
      }else{
        this.db = db; //store the db connection
      }
    }

  create(badge_name, badge_image_link){
    const query = "INSERT INTO BadgeContent (badge_id, badge_name, badge_image_link) VALUES (NULL, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(badge_name, badge_image_link);

    return {id: info.lastInsertRowid, badge_name, badge_image_link};
  }

  getById(badge_id){
    const query = "SELECT * FROM BadgeContent WHERE badge_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(badge_id);

    return info;
  }

  getByName(badge_name){
    const query = "SELECT * FROM BadgeContent WHERE badge_name = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(badge_name);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM BadgeContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(badge_id, badge_name, badge_image_link){
    const query = "UPDATE BadgeContent SET badge_name = ?, badge_image_link = ? WHERE badge_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(badge_name, badge_image_link, badge_id,);

    return this.getById(badge_id);
  }

  delete(badge_id){
    const query = "DELETE FROM BadgeContent WHERE badge_id = ?";

    const deleted_info = this.getById(badge_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(badge_id);

    return deleted_info;
  }
}

module.exports = badgeContentModel;