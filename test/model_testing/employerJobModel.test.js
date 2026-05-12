const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const EmployerJobModel = require('../../models/employerJobModel');

describe('EmployerJobModel', function () {
    let db;
    let employerJobModel;

    before(function () {
        db = connectTestDatabase();

        // Seed users
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();

        // Seed jobs
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (3, 'Bird feeding', '2025-01-03 08:00', 30, 10001, 1, 0, 0)`).run();

        employerJobModel = new EmployerJobModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return job_id and employer_id', function () {
            const result = employerJobModel.create(1, 1);

            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.employer_id, 1);
        });

        it('should throw on duplicate job_id (PK constraint)', function () {
            assert.throws(() => {
                employerJobModel.create(1, 2);
            });
        });

        it('should throw when job_id does not exist (FK violation)', function () {
            assert.throws(() => {
                employerJobModel.create(999, 1);
            });
        });

        it('should throw when employer_id does not exist (FK violation)', function () {
            assert.throws(() => {
                employerJobModel.create(2, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const result = employerJobModel.getById(1);

            assert.ok(result);
            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.employer_id, 1);
        });

        it('should return undefined for a non-existent job_id', function () {
            const result = employerJobModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        before(function () {
            employerJobModel.create(2, 1);
            employerJobModel.create(3, 2);
        });

        it('should return an array of all rows', function () {
            const results = employerJobModel.getAll();

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('getJobsByEmployerId()', function () {
        it('should return jobs belonging to the given employer', function () {
            const results = employerJobModel.getJobsByEmployerId(1);

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 2);
            results.forEach(row => {
                assert.strictEqual(row.employer_id, 1);
            });
        });

        it('should return an empty array for an employer with no jobs', function () {
            const results = employerJobModel.getJobsByEmployerId(99999);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 0);
        });

        it('should include job content fields', function () {
            const results = employerJobModel.getJobsByEmployerId(1);

            assert.ok(results.length > 0);
            assert.ok(Object.prototype.hasOwnProperty.call(results[0], 'description'));
            assert.ok(Object.prototype.hasOwnProperty.call(results[0], 'datetime'));
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update the employer_id and return the updated row', function () {
            const updated = employerJobModel.update(2, 2);

            assert.ok(updated);
            assert.strictEqual(updated.job_id, 2);
            assert.strictEqual(updated.employer_id, 2);
        });

        it('should persist the update when re-fetched', function () {
            const fetched = employerJobModel.getById(2);

            assert.strictEqual(fetched.employer_id, 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = employerJobModel.delete(3);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_id, 3);
        });

        it('should remove the row from the database', function () {
            const result = employerJobModel.getById(3);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent row', function () {
            const result = employerJobModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
