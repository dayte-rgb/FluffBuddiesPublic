const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobPaymentModel = require('../../models/jobPaymentModel');

describe('JobPaymentModel', function () {
    let db;
    let jobPaymentModel;

    before(function () {
        db = connectTestDatabase();

        // Seed JobContent
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();

        // Seed PaymentContent
        db.prepare(`INSERT INTO PaymentContent (payment_id, payment_name) VALUES (1, 'Cash')`).run();
        db.prepare(`INSERT INTO PaymentContent (payment_id, payment_name) VALUES (2, 'Credit Card')`).run();

        jobPaymentModel = new JobPaymentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return job_id, payment_id, and payment_quantity', function () {
            const result = jobPaymentModel.create(1, 1, 50);

            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.payment_id, 1);
            assert.strictEqual(result.payment_quantity, 50);
        });

        it('should throw on duplicate job_id (PK constraint)', function () {
            assert.throws(() => {
                jobPaymentModel.create(1, 2, 100);
            });
        });

        it('should throw when job_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobPaymentModel.create(999, 1, 50);
            });
        });

        it('should throw when payment_id does not exist (FK violation)', function () {
            assert.throws(() => {
                jobPaymentModel.create(2, 999, 50);
            });
        });

        it('should throw when payment_quantity is negative (CHECK constraint)', function () {
            assert.throws(() => {
                jobPaymentModel.create(2, 1, -1);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const result = jobPaymentModel.getById(1);

            assert.ok(result);
            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.payment_id, 1);
            assert.strictEqual(result.payment_quantity, 50);
        });

        it('should return undefined for a non-existent job_id', function () {
            const result = jobPaymentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        before(function () {
            jobPaymentModel.create(2, 2, 100);
        });

        it('should return an array', function () {
            const results = jobPaymentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted rows', function () {
            const results = jobPaymentModel.getAll();

            assert.strictEqual(results.length, 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const updated = jobPaymentModel.update(1, 2, 75);

            assert.ok(updated);
            assert.strictEqual(updated.job_id, 1);
            assert.strictEqual(updated.payment_id, 2);
            assert.strictEqual(updated.payment_quantity, 75);
        });

        it('should persist the update when re-fetched', function () {
            const fetched = jobPaymentModel.getById(1);

            assert.strictEqual(fetched.payment_id, 2);
            assert.strictEqual(fetched.payment_quantity, 75);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = jobPaymentModel.delete(2);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_id, 2);
        });

        it('should remove the row from the database', function () {
            const result = jobPaymentModel.getById(2);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = jobPaymentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
