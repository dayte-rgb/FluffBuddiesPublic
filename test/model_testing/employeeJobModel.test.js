const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const EmployeeJobModel = require('../../models/employeeJobModel');

describe('EmployeeJobModel', function () {
    let db;
    let employeeJobModel;

    before(function () {
        db = connectTestDatabase();

        // Seed users
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (3, 'carol', 'pw', '3333333333', 'carol@example.com', 10003, 'user')`).run();

        // Seed jobs
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();

        // Seed EmployerJob (required for getBookingsByEmployeeId JOIN)
        db.prepare(`INSERT INTO EmployerJob (job_id, employer_id) VALUES (1, 1)`).run();
        db.prepare(`INSERT INTO EmployerJob (job_id, employer_id) VALUES (2, 1)`).run();

        employeeJobModel = new EmployeeJobModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return job_id and employee_id', function () {
            const result = employeeJobModel.create(1, 2);

            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.employee_id, 2);
        });

        it('should throw on duplicate (job_id, employee_id) pair', function () {
            assert.throws(() => {
                employeeJobModel.create(1, 2);
            });
        });

        it('should throw when job_id does not exist (FK violation)', function () {
            assert.throws(() => {
                employeeJobModel.create(999, 2);
            });
        });

        it('should throw when employee_id does not exist (FK violation)', function () {
            assert.throws(() => {
                employeeJobModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row', function () {
            const result = employeeJobModel.getByIds(1, 2);

            assert.ok(result);
            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.employee_id, 2);
        });

        it('should return undefined when not found', function () {
            const result = employeeJobModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = employeeJobModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should contain all inserted rows', function () {
            employeeJobModel.create(2, 3);
            const results = employeeJobModel.getAll();

            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('getBookingsByEmployeeId()', function () {
        it('should return jobs booked by the given employee', function () {
            const results = employeeJobModel.getBookingsByEmployeeId(2);

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 1);
            results.forEach(row => {
                assert.strictEqual(row.employee_id, 2);
            });
        });

        it('should return an empty array for an employee with no bookings', function () {
            const results = employeeJobModel.getBookingsByEmployeeId(99999);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 0);
        });

        it('should include job content fields and employer username', function () {
            const results = employeeJobModel.getBookingsByEmployeeId(2);

            assert.ok(results.length > 0);
            assert.ok(Object.prototype.hasOwnProperty.call(results[0], 'description'));
            assert.ok(Object.prototype.hasOwnProperty.call(results[0], 'employer_username'));
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting', function () {
            const deleted = employeeJobModel.delete(1, 2);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_id, 1);
            assert.strictEqual(deleted.employee_id, 2);
        });

        it('should remove the row from the database', function () {
            const result = employeeJobModel.getByIds(1, 2);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent row', function () {
            const result = employeeJobModel.delete(999, 999);

            assert.strictEqual(result, undefined);
        });
    });
});
