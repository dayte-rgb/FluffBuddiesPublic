const { connectToDatabase } = require('../database');

class achievementModel {
  constructor() {
    this.db = connectToDatabase();

    this._getNumJobs = this.db.prepare(`
        SELECT u.user_id, COUNT(*) as num_jobs
        FROM User u 
        JOIN EmployeeJob ej ON u.user_id = ej.employee_id
        JOIN JobContent jc ON ej.job_id = jc.job_id
        WHERE jc.job_completed = 1
        GROUP BY u.user_id;
    `);

    this._getReviewWritten = this.db.prepare(`
        SELECT u.user_id, COUNT(*) as num_reviews_written
        FROM User u
        JOIN EmployerJob ej ON u.user_id = ej.employer_id
        JOIN JobContent jc ON ej.job_id = jc.job_id
        JOIN JobReview jr ON jc.job_id = jr.job_id
        WHERE jc.job_completed = 1
        GROUP BY u.user_id;
    `);

    this._getReviewReceived = this.db.prepare(`
        SELECT u.user_id, COUNT(*) as num_reviews_received
        FROM User u
        JOIN UserReview ur ON u.user_id = ur.user_id
        GROUP BY u.user_id;
    `);

    this._getAchievementQuery = this.db.prepare(`
        SELECT a.achievement_id
        FROM AchievementContent a
        JOIN BadgeContent bc ON a.badge_id = bc.badge_id
        JOIN UserBadge ub ON bc.badge_id = ub.badge_id
        WHERE ub.user_id = ?;
    `);

    this._getAchievAndBadgeQuery = this.db.prepare(`
        SELECT a.achievement_id, a.achievement_name, a.required_quantity, bc.badge_id, bc.badge_image_link
        FROM AchievementContent a
        JOIN BadgeContent bc ON a.badge_id = bc.badge_id;
    `);
   };

   getJobsCompleted(){
    return this._getNumJobs.all();
   }

   getReviewsWritten(){
    return this._getReviewWritten.all();
   }

   getReviewsReceived(){
    return this._getReviewReceived.all();
   }

   getAchievementsCompleted(user_id){
    return this._getAchievementQuery.all(user_id);
   }

   getAchivementsAndBadges(){
    return this._getAchievAndBadgeQuery.all();
   }
}

module.exports = achievementModel;