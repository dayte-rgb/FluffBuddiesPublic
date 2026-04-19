const { connectToDatabase } = require('../database');

class leaderboardContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(reward_end_time, start_time, end_time){
    const query = "INSERT INTO LeaderboardContent (leaderboard_id, reward_end_time, start_time, end_time, required_quantity) VALUES (NULL, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(reward_end_time, start_time, end_time);

    return {id: info.lastInsertRowid, reward_end_time, start_time, end_time};
  }

  retrieve(leaderboard_id){
    const query = "SELECT * FROM LeaderboardContent WHERE leaderboard_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.get(leaderboard_id);

    return info;
  }

  update(leaderboard_id, reward_end_time, start_time, end_time){
    const query = "UPDATE LeaderboardContent SET reward_end_time = ?, start_time = ?, end_time = ? WHERE leaderboard_id = ?";

    const old_info = this.retrieve(leaderboard_id);

    if(reward_end_time == null){
        reward_end_time = old_info.reward_end_time;
    }
    
    if(start_time == null){
        start_time = old_info.start_time;
    }

    if(end_time == null){
        end_time = old_info.end_time;
    }

    const stmt = this.db.prepare(query);

    const info = stmt.run(reward_end_time, start_time, end_time, leaderboard_id);

    return this.retrieve(leaderboard_id);
  }

  delete(leaderboard_id){
    const query = "DELETE FROM LeaderboardContent WHERE leaderboard_id = ?";

    const old_info = this.retrieve(leaderboard_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(leaderboard_id);

    return old_info;
  }
}

module.exports = leaderboardContentModel;