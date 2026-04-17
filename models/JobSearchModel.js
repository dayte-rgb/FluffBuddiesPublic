const { connectToDatabase } = require('../database');

class jobSearchModel {

  constructor() {
    this.db = connectToDatabase();

    //DISTINCT as the joins could cause duplicate job contents with those skill/job categories
    this._getAllMatchedJobs = this.db.prepare(`
        SELECT DISTINCT jcontent.*
        FROM JobContent jcontent 
        JOIN SkillCategoriesByJob skillcat ON jcontent.job_id = skillcat.job_id
        JOIN JobCategoriesByJob   jobcat   ON jcontent.job_id = jobcat.job_id
        WHERE (@zipcode IS NULL OR jcontent.zipcode = @zipcode)
        AND (@keyword IS NULL   OR jcontent.description LIKE @keyword)
        AND (@skill_id IS NULL  OR skillcat.skill_category_id = @skill_id)
        AND (@job_id IS NULL    OR jobcat.job_category_id = @job_id)
        ORDER BY RANDOM();
    `);

    this._getKMatchedJobs = this.db.prepare(`
        SELECT DISTINCT jcontent.*
        FROM JobContent jcontent 
        JOIN SkillCategoriesByJob skillcat ON jcontent.job_id = skillcat.job_id
        JOIN JobCategoriesByJob   jobcat   ON jcontent.job_id = jobcat.job_id
        WHERE (@zipcode IS NULL OR jcontent.zipcode = @zipcode)
        AND (@keyword IS NULL   OR jcontent.description LIKE @keyword)
        AND (@skill_id IS NULL  OR skillcat.skill_category_id = @skill_id)
        AND (@job_id IS NULL    OR jobcat.job_category_id = @job_id)
        ORDER BY RANDOM()
        LIMIT @k;
    `);
  }

  getAllMatchedJobs(zipcode, keyword, skill_cat_id, job_cat_id){
    return this._getAllMatchedJobs.all({
        zipcode: zipcode,
        keyword: keyword ? `%${keyword}%` : null, //? prevents operation on null, need to prepare the keyword before it goes into the SQL query, : null means otherwise pass null
        skill_id: skill_cat_id,
        job_id: job_cat_id
    });
  }

  getKMatchedJobs(zipcode, keyword, skill_cat_id, job_cat_id, k){
    return this._getKMatchedJobs.all({
        zipcode: zipcode,
        keyword: keyword ? `%${keyword}%` : null,
        skill_id: skill_cat_id,
        job_id: job_cat_id,
        k: k
    });
  }
}

module.exports = jobSearchModel;