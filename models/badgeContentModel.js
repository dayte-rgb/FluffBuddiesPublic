const { connectToDatabase } = require('../database');

class badgeContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(badge_name, badge_image_link){
    const query = "INSERT INTO BadgeContent (badge_id, badge_name, badge_image_link) VALUES (NULL, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = query.run(badge_name, badge_image_link);

    return {id: info.lastInsertRowid, badge_name, badge_image_link};
  }

  retrieve(badge_id){
    const query = "SELECT * FROM BadgeContent WHERE badge_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(badge_id);

    return info;
  }

  update(badge_id, badge_name, badge_image_link){
    const query = "UPDATE BadgeContent SET badge_name = ?, badge_image_link = ? WHERE badge_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(badge_name, badge_id, badge_image_link);

    return this.retrieve(badge_id);
  }

  delete(badge_id){
    const query = "DELETE FROM BadgeContent WHERE badge_id = ?";

    const deleted_info = retrieve(badge_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(badge_id);

    return deleted_info;
  }
}

module.exports = badgeContentModel;