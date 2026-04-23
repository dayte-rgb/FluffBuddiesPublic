const { connectToDatabase } = require('../database');

class jobSearchModel {

  constructor() {
    this.db = connectToDatabase();
  }

  getAllMatchedJobs(zipcode, keyword, skill_cat_ids, job_cat_ids){

    // here, many operations will give errors if skill_cat_ids or job_cat_ids are null, so create a value that tells us that
    let hasSkills;
    let hasJobs;

    // ensures against null and [] (empty list)
    if(skill_cat_ids != null && skill_cat_ids.length > 0){
      hasSkills = 1;
    };

    if(job_cat_ids != null && job_cat_ids.length > 0){
      hasJobs = 1;
    };

    //unknown what the length of the skill ids are, so map our ids to parameters for the SQL query
    //(_, i) ignores the value and only cares about the order in which they appear
    //.join(', ') joins @s0...@sn into a string, @s0, @s1, ... , @sn for the SQL query
    const s_placeholders = hasSkills ? skill_cat_ids.map((_, i) => `@s${i}`).join(', ') : null;
    const j_placeholders = hasJobs ? job_cat_ids.map((_, i) => `@j${i}`).join(', ') : null;

    //here, map each value in skill_cat_ids to its s_param in the order it appears
    // ? checks to see if hasSkills is null, if so, doesn't run the function, avoiding the error
    const s_params = hasSkills ? Object.fromEntries(skill_cat_ids.map((cat_id, i) => [`s${i}`, cat_id])) : {};
    const j_params = hasJobs ? Object.fromEntries(job_cat_ids.map((cat_id, i) => [`j${i}`, cat_id])) : {};

    //uses subqueries to ensure the job content matches the skill and job ids perfectly
    //DISTINCT as the joins could cause duplicate job contents with those skill/job categories
    // Crazy thing here, but we need to prevent against the SQL trying to open a null object when we pass no skill categories or job categories
    // So, we wrap it in JavaScript. If hasSkills is null, ? will catch that and make that part just '', avoiding the error.
    const stmt = this.db.prepare(`
        SELECT DISTINCT jcontent.*
        FROM JobContent jcontent 
        JOIN SkillCategoriesByJob skillcat ON jcontent.job_id = skillcat.job_id
        JOIN JobCategoriesByJob   jobcat   ON jcontent.job_id = jobcat.job_id
        WHERE (@zipcode IS NULL OR jcontent.zipcode = @zipcode)
        AND (@keyword IS NULL   OR jcontent.description LIKE @keyword)
        ${hasSkills ? `AND jcontent.job_id IN (
            SELECT DISTINCT sc.job_id
            FROM SkillCategoriesByJob sc
            WHERE sc.skill_category_id IN (${s_placeholders})
            GROUP BY job_id
            HAVING COUNT(DISTINCT sc.skill_category_id) = @s_total
        )` : ''}
        ${hasJobs ? `AND jcontent.job_id IN (
            SELECT DISTINCT jc.job_id
            FROM JobCategoriesByJob jc
            WHERE jc.job_category_id IN (${j_placeholders})
            GROUP BY job_id
            HAVING COUNT(DISTINCT jc.job_category_id) = @j_total
        )` : ''}
        ORDER BY RANDOM();
    `);
    
    let skill_length;
    let job_length;

    if(hasSkills != null){
      skill_length = skill_cat_ids.length;
    }

    if(hasJobs != null){
      job_length = job_cat_ids.length;
    }

    const params = {
      zipcode: zipcode,
        keyword: keyword ? `%${keyword}%` : null,
        ...s_params, // ... joins the objects together
        ...j_params,
        s_total: skill_length,
        j_total: job_length
    };

    return stmt.all(params);
  }

  getKMatchedJobs(zipcode, keyword, skill_cat_ids, job_cat_ids, k){

    // here, many operations will give errors if skill_cat_ids or job_cat_ids are null, so create a value that tells us that
    let hasSkills;
    let hasJobs;

    // ensures against null and [] (empty list)
    if(skill_cat_ids != null && skill_cat_ids.length > 0){
      hasSkills = 1;
    };

    if(job_cat_ids != null && job_cat_ids.length > 0){
      hasJobs = 1;
    };

    //unknown what the length of the skill ids are, so map our ids to parameters for the SQL query
    //(_, i) ignores the value and only cares about the order in which they appear
    //.join(', ') joins @s0...@sn into a string, @s0, @s1, ... , @sn for the SQL query
    const s_placeholders = hasSkills ? skill_cat_ids.map((_, i) => `@s${i}`).join(', ') : null;
    const j_placeholders = hasJobs ? job_cat_ids.map((_, i) => `@j${i}`).join(', ') : null;

    //here, map each value in skill_cat_ids to its s_param in the order it appears
    // ? checks to see if hasSkills is null, if so, doesn't run the function, avoiding the error
    const s_params = hasSkills ? Object.fromEntries(skill_cat_ids.map((cat_id, i) => [`s${i}`, cat_id])) : {};
    const j_params = hasJobs ? Object.fromEntries(job_cat_ids.map((cat_id, i) => [`j${i}`, cat_id])) : {};

    //uses subqueries to ensure the job content matches the skill and job ids perfectly
    //DISTINCT as the joins could cause duplicate job contents with those skill/job categories
    // Crazy thing here, but we need to prevent against the SQL trying to open a null object when we pass no skill categories or job categories
    // So, we wrap it in JavaScript. If hasSkills is null, ? will catch that and make that part just '', avoiding the error.
    const stmt = this.db.prepare(`
        SELECT DISTINCT jcontent.*
        FROM JobContent jcontent 
        JOIN SkillCategoriesByJob skillcat ON jcontent.job_id = skillcat.job_id
        JOIN JobCategoriesByJob   jobcat   ON jcontent.job_id = jobcat.job_id
        WHERE (@zipcode IS NULL OR jcontent.zipcode = @zipcode)
        AND (@keyword IS NULL   OR jcontent.description LIKE @keyword)
        ${hasSkills ? `AND jcontent.job_id IN (
            SELECT DISTINCT sc.job_id
            FROM SkillCategoriesByJob sc
            WHERE sc.skill_category_id IN (${s_placeholders})
            GROUP BY job_id
            HAVING COUNT(DISTINCT sc.skill_category_id) = @s_total
        )` : ''}
        ${hasJobs ? `AND jcontent.job_id IN (
            SELECT DISTINCT jc.job_id
            FROM JobCategoriesByJob jc
            WHERE jc.job_category_id IN (${j_placeholders})
            GROUP BY job_id
            HAVING COUNT(DISTINCT jc.job_category_id) = @j_total
        )` : ''}
        ORDER BY RANDOM()
        LIMIT @k;
    `);
    
    let skill_length;
    let job_length;

    if(hasSkills != null){
      skill_length = skill_cat_ids.length;
    }

    if(hasJobs != null){
      job_length = job_cat_ids.length;
    }

    const params = {
      zipcode: zipcode,
        keyword: keyword ? `%${keyword}%` : null,
        ...s_params, // ... joins the objects together
        ...j_params,
        s_total: skill_length,
        j_total: job_length,
        k: k
    };

    return stmt.all(params);
  }
}

module.exports = jobSearchModel;