const { connectToDatabase } = require('../database');

class leaderboardContentModel {
  constructor() {
    this.db = connectToDatabase();
  }

  create(reward_badge_id, start_time, end_time, metric_id, badge_id){
    const query = "INSERT INTO LeaderboardContent (leaderboard_id, reward_badge_id, start_time, end_time, metric_id, badge_id) VALUES (NULL, ?, ?, ?, ?, ?)";

    const stmt = this.db.prepare(query);

    const info = stmt.run(reward_badge_id, start_time, end_time, metric_id, badge_id);

    return {id: info.lastInsertRowid, reward_badge_id, start_time, end_time, metric_id, badge_id};
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

  update(leaderboard_id, reward_badge_id, start_time, end_time, metric_id, badge_id){
    const query = "UPDATE LeaderboardContent SET reward_badge_id = ?, start_time = ?, end_time = ?, metric_id = ?, badge_id = ? WHERE leaderboard_id = ?";

    const stmt = this.db.prepare(query);

    const info = stmt.run(reward_badge_id, start_time, end_time, metric_id, badge_id, leaderboard_id);

    return this.getById(leaderboard_id);
  }

  delete(leaderboard_id){
    const query = "DELETE FROM LeaderboardContent WHERE leaderboard_id = ?";

    const old_info = this.getById(leaderboard_id);

    const stmt = this.db.prepare(query);

    const info = stmt.run(leaderboard_id);

    return old_info;
  }

  getCurrentLeaderboard() {
    const now = new Date().toISOString();
    const query = `SELECT * FROM LeaderboardContent 
                   WHERE start_time <= ? AND end_time >= ? 
                   ORDER BY leaderboard_id DESC LIMIT 1`;
    return this.db.prepare(query).get(now, now);
  }

  getEntriesByAvgRating(leaderboard_id) {
    // Get the leaderboard period for filtering
    const lb = this.getById(leaderboard_id);
    return this.db.prepare(`
      SELECT u.username as worker_name,
             ROUND(AVG((r.punctuality + r.quality + r.friendliness) / 3.0), 2) as avg_rating,
             COUNT(DISTINCT ej.job_id) as jobs_completed
      FROM EmployeeJob ej
      JOIN User u ON u.user_id = ej.employee_id
      JOIN JobContent jc ON jc.job_id = ej.job_id
      LEFT JOIN JobReview jr ON jr.job_id = ej.job_id
      LEFT JOIN ReviewContent r ON r.review_id = jr.review_id
      WHERE jc.datetime BETWEEN ? AND ?
      GROUP BY u.user_id
      ORDER BY avg_rating DESC
    `).all(lb.start_time, lb.end_time);
  }
}

module.exports = leaderboardContentModel;