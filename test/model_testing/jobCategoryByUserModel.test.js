const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobCategoryByUserModel = require('../../models/jobCategoryByUserModel');

describe('JobCategoryByUserModel', function () {
    let db;
    let jobCategoryByUserModel;

    before(function () {
        db = connectTestDatabase();

        // Seed User
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();

        // Seed JobCategory
        db.prepare(`INSERT INTO JobCategory (job_category_id, category_name) VALUES (1, 'Pet Care')`).run();
        db.prepare(`INSERT INTO JobCategory (job_category_id, category_name) VALUES (2, 'Transport')`).run();

        jobCategoryByUserModel = new JobCategoryByUserModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return user_id and job_category_id', function () {
            const result = jobCategoryByUserModel.create(1, 1);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.job_category_id, 1);
        });

        it('should allow the same user to have a different category', function () {
            const result = jobCategoryByUserModel.create(1, 2);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.job_category_id, 2);
        });

        it('should allow a different user to have the same category', function () {
            const result = jobCategoryByUserModel.create(2, 1);

            assert.strictEqual(result.user_id, 2);
            assert.strictEqual(result.job_category_id, 1);
        });

        it('should throw on duplicate (user_id, job_category_id) pair', function () {
            assert.throws(() => {
                jobCategoryByUserModel.create(1, 1);
            });
        });

        it('should throw when user_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobCategoryByUserModel.create(999, 1);
            });
        });

        it('should throw when job_category_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobCategoryByUserModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row', function () {
            const result = jobCategoryByUserModel.getByIds(1, 1);

            assert.ok(result);
            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.job_category_id, 1);
        });

        it('should return undefined when not found', function () {
            const result = jobCategoryByUserModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = jobCategoryByUserModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted rows', function () {
            const results = jobCategoryByUserModel.getAll();

            assert.strictEqual(results.length, 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = jobCategoryByUserModel.delete(1, 2);

            assert.ok(deleted);
            assert.strictEqual(deleted.user_id, 1);
            assert.strictEqual(deleted.job_category_id, 2);
        });

        it('should remove the row from the database', function () {
            const result = jobCategoryByUserModel.getByIds(1, 2);

            assert.strictEqual(result, undefined);
        });

        it('should not throw when deleting a non-existent row', function () {
            assert.doesNotThrow(() => {
                jobCategoryByUserModel.delete(999, 999);
            });
        });

        it('getAll() count should decrease after a successful delete', function () {
            const before = jobCategoryByUserModel.getAll().length;
            jobCategoryByUserModel.delete(2, 1);
            const after = jobCategoryByUserModel.getAll().length;

            assert.strictEqual(after, before - 1);
        });
    });
});
