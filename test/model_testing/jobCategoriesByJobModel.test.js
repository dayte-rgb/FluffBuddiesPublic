const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobCategoriesByJobModel = require('../../models/jobCategoriesByJobModel');

describe('JobCategoriesByJobModel', function () {
    let db;
    let jobCategoriesByJobModel;

    before(function () {
        db = connectTestDatabase();

        // Seed JobContent
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();

        // Seed JobCategory
        db.prepare(`INSERT INTO JobCategory (job_category_id, category_name) VALUES (1, 'Pet Care')`).run();
        db.prepare(`INSERT INTO JobCategory (job_category_id, category_name) VALUES (2, 'Transport')`).run();

        jobCategoriesByJobModel = new JobCategoriesByJobModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return job_id and job_category_id', function () {
            const result = jobCategoriesByJobModel.create(1, 1);

            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.job_category_id, 1);
        });

        it('should allow the same category on a different job', function () {
            const result = jobCategoriesByJobModel.create(2, 1);

            assert.strictEqual(result.job_id, 2);
            assert.strictEqual(result.job_category_id, 1);
        });

        it('should throw on duplicate (job_id, job_category_id) pair', function () {
            assert.throws(() => {
                jobCategoriesByJobModel.create(1, 1);
            });
        });

        it('should throw when job_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobCategoriesByJobModel.create(999, 1);
            });
        });

        it('should throw when job_category_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobCategoriesByJobModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row', function () {
            const result = jobCategoriesByJobModel.getByIds(1, 1);

            assert.ok(result);
            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.job_category_id, 1);
        });

        it('should return undefined when not found', function () {
            const result = jobCategoriesByJobModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = jobCategoriesByJobModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted rows', function () {
            const results = jobCategoriesByJobModel.getAll();

            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = jobCategoriesByJobModel.delete(2, 1);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_id, 2);
            assert.strictEqual(deleted.job_category_id, 1);
        });

        it('should remove the row from the database', function () {
            const result = jobCategoriesByJobModel.getByIds(2, 1);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent row', function () {
            const result = jobCategoriesByJobModel.delete(999, 999);

            assert.strictEqual(result, undefined);
        });
    });
});
