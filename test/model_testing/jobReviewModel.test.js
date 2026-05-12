const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobReviewModel = require('../../models/jobReviewModel');

describe('JobReviewModel', function () {
    let db;
    let jobReviewModel;

    before(function () {
        db = connectTestDatabase();

        // Seed JobContent
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();

        // Seed ReviewContent (required FK for JobReview)
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (1, 5, 5, 5, 'Great', '2025-01-01', 0)`).run();
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (2, 4, 4, 4, 'Good', '2025-01-02', 0)`).run();
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (3, 3, 3, 3, 'Okay', '2025-01-03', 0)`).run();

        jobReviewModel = new JobReviewModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return review_id and job_id', function () {
            const result = jobReviewModel.create(1, 1);

            assert.strictEqual(result.review_id, 1);
            assert.strictEqual(result.job_id, 1);
        });

        it('should allow multiple reviews for the same job', function () {
            const result = jobReviewModel.create(2, 1);

            assert.strictEqual(result.review_id, 2);
            assert.strictEqual(result.job_id, 1);
        });

        it('should throw on duplicate review_id (PK constraint)', function () {
            assert.throws(() => {
                jobReviewModel.create(1, 2);
            });
        });

        it('should throw when review_id does not exist in ReviewContent (FK violation)', function () {
            assert.throws(() => {
                jobReviewModel.create(999, 1);
            });
        });

        it('should throw when job_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobReviewModel.create(3, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row by review_id', function () {
            const result = jobReviewModel.getById(1);

            assert.ok(result);
            assert.strictEqual(result.review_id, 1);
            assert.strictEqual(result.job_id, 1);
        });

        it('should return undefined for a non-existent review_id', function () {
            const result = jobReviewModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByJobId() / getAllByJobId()', function () {
        it('getByJobId should return all reviews for a job', function () {
            const results = jobReviewModel.getByJobId(1);

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 2);
        });

        it('getByJobId should return an empty array for a job with no reviews', function () {
            const results = jobReviewModel.getByJobId(99999);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 0);
        });

        it('getAllByJobId should return the same results as getByJobId', function () {
            const a = jobReviewModel.getByJobId(1);
            const b = jobReviewModel.getAllByJobId(1);

            assert.deepStrictEqual(a, b);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array of all rows', function () {
            const results = jobReviewModel.getAll();

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update job_id and return the updated row', function () {
            jobReviewModel.create(3, 2);
            const updated = jobReviewModel.update(3, 1);

            assert.ok(updated);
            assert.strictEqual(updated.review_id, 3);
            assert.strictEqual(updated.job_id, 1);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = jobReviewModel.delete(3);

            assert.ok(deleted);
            assert.strictEqual(deleted.review_id, 3);
        });

        it('should remove the row from the database', function () {
            const result = jobReviewModel.getById(3);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = jobReviewModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
