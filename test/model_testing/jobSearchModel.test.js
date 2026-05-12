const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobSearchModel = require('../../models/jobSearchModel');

describe('JobSearchModel', function () {
    let db;
    let jobSearchModel;

    before(function () {
        db = connectTestDatabase();

        // Seed users and employer links
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();

        // Seed SkillCategory and JobCategory
        db.prepare(`INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (1, 'Dog Training')`).run();
        db.prepare(`INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (2, 'Cat Care')`).run();
        db.prepare(`INSERT INTO JobCategory (job_category_id, category_name) VALUES (1, 'Pet Care')`).run();
        db.prepare(`INSERT INTO JobCategory (job_category_id, category_name) VALUES (2, 'Transport')`).run();

        // Seed Jobs
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking downtown', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting uptown', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (3, 'Bird feeding', '2025-01-03 08:00', 30, 10001, 1, 0, 0)`).run();

        // Seed EmployerJob
        db.prepare(`INSERT INTO EmployerJob (job_id, employer_id) VALUES (1, 1)`).run();
        db.prepare(`INSERT INTO EmployerJob (job_id, employer_id) VALUES (2, 1)`).run();
        db.prepare(`INSERT INTO EmployerJob (job_id, employer_id) VALUES (3, 1)`).run();

        // Assign skill and job categories to jobs
        db.prepare(`INSERT INTO SkillCategoriesByJob (job_id, skill_category_id) VALUES (1, 1)`).run();
        db.prepare(`INSERT INTO SkillCategoriesByJob (job_id, skill_category_id) VALUES (2, 2)`).run();
        db.prepare(`INSERT INTO SkillCategoriesByJob (job_id, skill_category_id) VALUES (3, 1)`).run();
        db.prepare(`INSERT INTO JobCategoriesByJob (job_id, job_category_id) VALUES (1, 1)`).run();
        db.prepare(`INSERT INTO JobCategoriesByJob (job_id, job_category_id) VALUES (2, 1)`).run();
        db.prepare(`INSERT INTO JobCategoriesByJob (job_id, job_category_id) VALUES (3, 2)`).run();

        jobSearchModel = new JobSearchModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('getAllMatchedJobs()', function () {
        it('should return all jobs when all filters are null', function () {
            const results = jobSearchModel.getAllMatchedJobs(null, null, null, null);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 3);
        });

        it('should filter by zipcode', function () {
            const results = jobSearchModel.getAllMatchedJobs(10001, null, null, null);

            assert.ok(results.length >= 1);
            results.forEach(row => {
                assert.strictEqual(row.zipcode, 10001);
            });
        });

        it('should filter by keyword in description', function () {
            const results = jobSearchModel.getAllMatchedJobs(null, 'Dog', null, null);

            assert.ok(results.length >= 1);
            results.forEach(row => {
                assert.ok(row.description.toLowerCase().includes('dog'));
            });
        });

        it('should filter by skill category', function () {
            const results = jobSearchModel.getAllMatchedJobs(null, null, [1], null);

            assert.ok(results.length >= 1);
        });

        it('should filter by job category', function () {
            const results = jobSearchModel.getAllMatchedJobs(null, null, null, [1]);

            assert.ok(results.length >= 1);
        });

        it('should filter by both zipcode and keyword', function () {
            const results = jobSearchModel.getAllMatchedJobs(10001, 'Dog', null, null);

            assert.ok(Array.isArray(results));
            results.forEach(row => {
                assert.strictEqual(row.zipcode, 10001);
                assert.ok(row.description.toLowerCase().includes('dog'));
            });
        });

        it('should return empty array when no jobs match', function () {
            const results = jobSearchModel.getAllMatchedJobs(99999, null, null, null);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 0);
        });

        it('should include username from the employer', function () {
            const results = jobSearchModel.getAllMatchedJobs(null, null, null, null);

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'username'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getKMatchedJobs()', function () {
        it('should return at most k results', function () {
            const results = jobSearchModel.getKMatchedJobs(null, null, null, null, 2);

            assert.ok(Array.isArray(results));
            assert.ok(results.length <= 2);
        });

        it('should return all results when k is larger than total', function () {
            const results = jobSearchModel.getKMatchedJobs(null, null, null, null, 100);

            assert.strictEqual(results.length, 3);
        });

        it('should return empty array when no jobs match', function () {
            const results = jobSearchModel.getKMatchedJobs(99999, null, null, null, 5);

            assert.strictEqual(results.length, 0);
        });
    });
});
