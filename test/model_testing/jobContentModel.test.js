const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobContentModel = require('../../models/jobContentModel');

describe('JobContentModel', function () {
    let db;
    let jobContentModel;

    before(function () {
        db = connectTestDatabase();
        jobContentModel = new JobContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new job with its id', function () {
            const result = jobContentModel.create('Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0);

            assert.ok(result.id);
            assert.strictEqual(result.description, 'Dog walking');
            assert.strictEqual(result.duration, 60);
            assert.strictEqual(result.job_filled, 0);
            assert.strictEqual(result.job_completed, 0);
        });

        it('should throw when employee_num is 0 (CHECK constraint)', function () {
            assert.throws(() => {
                jobContentModel.create('Bad Job', '2025-01-01 09:00', 60, 10001, 0, 0, 0);
            });
        });

        it('should throw when job_filled is not 0 or 1 (CHECK constraint)', function () {
            assert.throws(() => {
                jobContentModel.create('Bad Job', '2025-01-01 09:00', 60, 10001, 1, 5, 0);
            });
        });

        it('should throw when job_completed is not 0 or 1 (CHECK constraint)', function () {
            assert.throws(() => {
                jobContentModel.create('Bad Job', '2025-01-01 09:00', 60, 10001, 1, 0, 5);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = jobContentModel.create('Cat sitting', '2025-01-02 10:00', 120, 10002, 2, 0, 0);
            const result = jobContentModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.job_id, created.id);
            assert.strictEqual(result.description, 'Cat sitting');
        });

        it('should return undefined for a non-existent id', function () {
            const result = jobContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = jobContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted jobs', function () {
            const results = jobContentModel.getAll();

            assert.ok(results.length >= 2);
        });

        it('every row should have required fields', function () {
            const results = jobContentModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'job_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'description'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'employee_num'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'job_filled'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'job_completed'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = jobContentModel.create('Bird feeding', '2025-01-03 08:00', 30, 10001, 1, 0, 0);
            const updated = jobContentModel.update(created.id, 'Bird feeding updated', '2025-02-01 08:00', 45, 10003, 2, 1, 0);

            assert.strictEqual(updated.description, 'Bird feeding updated');
            assert.strictEqual(updated.duration, 45);
            assert.strictEqual(updated.job_filled, 1);
        });

        it('should persist the update when re-fetched', function () {
            const all = jobContentModel.getAll();
            const job = all[all.length - 1];
            jobContentModel.update(job.job_id, 'Persisted', '2025-03-01 08:00', 10, 10001, 1, 0, 1);
            const fetched = jobContentModel.getById(job.job_id);

            assert.strictEqual(fetched.description, 'Persisted');
            assert.strictEqual(fetched.job_completed, 1);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = jobContentModel.create('To Delete', '2025-01-05 09:00', 60, 10001, 1, 0, 0);
            const deleted = jobContentModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_id, created.id);
            assert.strictEqual(deleted.description, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const all = jobContentModel.getAll();
            const job = all[all.length - 1];
            jobContentModel.delete(job.job_id);

            const result = jobContentModel.getById(job.job_id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = jobContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
