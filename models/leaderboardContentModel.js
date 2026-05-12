const { connectToDatabase } = require('../database');

class leaderboardContentModel {
  constructor(db) {
    this.db = db || connectToDatabase();
  }

  create(start_time, end_time, metric_id, badge_id){
    const query = "INSERT INTO LeaderboardContent (leaderboard_id, start_time, end_time, metric_id, badge_id) VALUES (NULL, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(start_time, end_time, metric_id, badge_id);

    return {id: info.lastInsertRowid, start_time, end_time, metric_id, badge_id};
  }

  getById(leaderboard_id){
    const query = "SELECT * FROM LeaderboardContent WHERE leaderboard_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(leaderboard_id);

    return info;
  }

  getAll(){
    const query = 'SELECT * FROM LeaderboardContent';

    const stmt = this.db.prepare(query);

    const info = stmt.all();

    return info;
  }

  update(leaderboard_id, start_time, end_time, metric_id, badge_id){
    const query = "UPDATE LeaderboardContent SET start_time = ?, end_time = ?, metric_id = ?, badge_id = ? WHERE leaderboard_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(start_time, end_time, metric_id, badge_id, leaderboard_id);

    return this.getById(leaderboard_id);
  }

  delete(leaderboard_id){
    const query = "DELETE FROM LeaderboardContent WHERE leaderboard_id = ?";

    const old_info = this.getById(leaderboard_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(leaderboard_id);

    return old_info;
  }
}

module.exports = leaderboardContentModel;