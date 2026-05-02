const { connectToDatabase } = require('../database');

class leaderboardModel {
  constructor() {
    this.db = connectToDatabase();

    this._getMostJobsDone = this.db.prepare(`
        SELECT u.user_id, u.username, COUNT(*) as user_total
        FROM EmployeeJob ej
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN User u ON u.user_id = ej.employee_id
        WHERE jc.job_completed = 1
        GROUP BY u.user_id
        ORDER BY user_total DESC
        LIMIT @k;
    `);
    
    
    this._getHighestReview = this.db.prepare(`
        SELECT ur.user_id, u.username, AVG(r.punctuality + r.quality + r.friendliness) as user_avg_rating
        FROM UserReview ur
        JOIN ReviewContent r ON ur.review_id = r.review_id
        JOIN User u ON ur.user_id = u.user_id
        GROUP BY ur.user_id
        ORDER BY user_avg_rating DESC
        LIMIT @k;
    `);
  }

  getTopKMostJobs(k){
    return this._getMostJobsDone.all({k: k});
  }

  getTopKHighestAvgRating(k){
    return this._getHighestReview.all({k: k});
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

module.exports = leaderboardModel;