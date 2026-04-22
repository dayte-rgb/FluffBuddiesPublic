const { connectToDatabase } = require('../database');

class certificationContentModel {
  constructor() {
    this.db = connectToDatabase();

    this._getMostJobsDone = this.db.prepare(`
        SELECT u.user_id, COUNT(*) as user_total
        FROM EmployeeJob ej
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN User u ON u.user_id = ej.employee_id
        GROUP BY u.user_id
        HAVING jc.job_completed == 1
        ORDER BY user_total DESC
        LIMIT 5;
    `);
    
    //use a subquery to first get the overall rating per review, then find average for user
    this._getHighestReview = this.db.prepare(`
        SELECT u.user_id, AVG(r.punctuality + r.quality + r.friendliness) as  
        FROM(
        )
        
    `);
  }
}

module.exports = certificationContentModel;