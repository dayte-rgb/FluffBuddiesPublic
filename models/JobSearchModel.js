const { connectToDatabase } = require('../database');

class jobSearchModel {

  constructor() {
    this.db = connectToDatabase();

    //DISTINCT as the joins could cause duplicate job contents with those skill/job categories
    

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

  getAllMatchedJobs(zipcode, keyword, skill_cat_ids, job_cat_ids){
    //unknown what the length of the skill ids are, so map our ids to parameters for the SQL query
    //(_, i) ignores the value and only cares about the order in which they appear
    //.join(', ') joins @s0...@sn into a string, @s0, @s1, ... , @sn for the SQL query
    const s_placeholders = skill_cat_ids.map((_, i) => `@s${i}`).join(', ');

    //likewise here
    const j_placeholders = job_cat_ids.map((_, i) => `@j${i}`).join(', ');

    //uses subqueries to ensure the job content matches the skill and job ids perfectly
    const stmt = this.db.prepare(`
        SELECT DISTINCT jcontent.*
        FROM JobContent jcontent 
        JOIN SkillCategoriesByJob skillcat ON jcontent.job_id = skillcat.job_id
        JOIN JobCategoriesByJob   jobcat   ON jcontent.job_id = jobcat.job_id
        WHERE (@zipcode IS NULL OR jcontent.zipcode = @zipcode)
        AND (@keyword IS NULL   OR jcontent.description LIKE @keyword)
        AND jcontent.job_id IN (
            SELECT DISTINCT sc.job_id
            FROM SkillCategoriesByJob sc
            JOIN JobCategoriesByJob jc ON sc.job_id = jc.job_id
            WHERE sc.skill_category_id IN (${s_placeholders})
            AND jc.job_category_id IN (${j_placeholders})
            GROUP BY job_id
            HAVING COUNT(DISTINCT sc.skill_category_id) = @s_total
            AND COUNT(DISTINCT jc.job_category_id) = @j_total
        )
        ORDER BY RANDOM();
    `);

    return stmt.all({
        zipcode: zipcode,
        keyword: keyword ? `%${keyword}%` : null,
        
    })


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