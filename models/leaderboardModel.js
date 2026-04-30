const { connectToDatabase } = require('../database');

class leaderboardModel {
  constructor() {
    this.db = connectToDatabase();

    this._getMostJobsDone = this.db.prepare(`
        SELECT u.user_id, COUNT(*) as user_total
        FROM EmployeeJob ej
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN User u ON u.user_id = ej.employee_id
        WHERE jc.job_completed = 1
        GROUP BY u.user_id
        ORDER BY user_total DESC
        LIMIT @k;
    `);
    
    
    this._getHighestReview = this.db.prepare(`
        SELECT ur.user_id, AVG(r.punctuality + r.quality + r.friendliness) as user_avg_rating
        FROM UserReview ur
        JOIN ReviewContent r ON ur.review_id = r.review_id
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
}

module.exports = leaderboardModel;