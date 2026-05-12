const { connectToDatabase } = require('../database');

class leaderboardModel {
  constructor(db = undefined) {
    if(db == undefined){
      this.db = connectToDatabase();
    }else{
      this.db = db; //store the db connection
    }

    this._getLeaderboardStats = this.db.prepare(`
        SELECT 
          u.username as worker_name, 
          COUNT(*) as jobs_completed, 
          ROUND((AVG(r.punctuality) + AVG(r.quality) + AVG(r.friendliness)) / 3.0, 2) as avg_rating
        FROM EmployeeJob ej
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN User u ON u.user_id = ej.employee_id
        LEFT JOIN JobReview jr ON jr.job_id = jc.job_id
        LEFT JOIN ReviewContent r ON r.review_id = jr.review_id
        WHERE jc.job_completed = 1 
        AND ((@start IS NULL AND @end IS NULL) OR jc.datetime BETWEEN @start AND @end)
        GROUP BY u.user_id
        ORDER BY jobs_completed DESC, avg_rating DESC;
    `);

    this._getTopRating = this.db.prepare(`
        SELECT 
          u.user_id, 
          ROUND((AVG(r.punctuality) + AVG(r.quality) + AVG(r.friendliness)) / 3.0, 2) as avg_rating
        FROM EmployeeJob ej
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN User u ON u.user_id = ej.employee_id
        LEFT JOIN JobReview jr ON jr.job_id = jc.job_id
        LEFT JOIN ReviewContent r ON r.review_id = jr.review_id
        WHERE jc.job_completed = 1
        AND ((@start IS NULL AND @end IS NULL) OR jc.datetime BETWEEN @start AND @end)
        GROUP BY u.user_id
        ORDER BY avg_rating DESC
        LIMIT @k;
    `);

    this._getTopJobs = this.db.prepare(`
        SELECT 
          u.user_id, 
          COUNT(*) as jobs_completed
        FROM EmployeeJob ej
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN User u ON u.user_id = ej.employee_id
        WHERE jc.job_completed = 1 
        AND (((@start IS NULL AND @end IS NULL) OR jc.datetime BETWEEN @start AND @end))
        GROUP BY u.user_id
        ORDER BY jobs_completed DESC
        LIMIT @k;
    `);

    this._getCurrLeaderboard = this.db.prepare(`
        SELECT * FROM LeaderboardContent 
        ORDER BY start_time DESC 
        LIMIT 1;
      `);
  }

  getCurrentLeaderboard() {
    return this._getCurrLeaderboard.get();
  }

  getLeaderboardStats(start_time = null, end_time = null){
    return this._getLeaderboardStats.all({
      start: start_time,
      end: end_time
    });
  }

  getTopKRating(start_time = null, end_time = null, k = 10){
    return this._getTopRating.all({
      k: k,
      start: start_time,
      end: end_time
    });
  }

  getTopKJobs(start_time = null, end_time = null, k = 10){
    return this._getTopJobs.all({
      k: k,
      start: start_time,
      end: end_time
    });
  }
}

module.exports = leaderboardModel;