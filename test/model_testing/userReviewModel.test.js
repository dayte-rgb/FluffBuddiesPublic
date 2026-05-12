const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const UserReviewModel = require('../../models/userReviewModel');

describe('UserReviewModel', function () {
    let db;
    let userReviewModel;

    before(function () {
        db = connectTestDatabase();

        // Seed Users
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();

        // Seed ReviewContent (required FK)
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (1, 5, 5, 5, 'Great', '2025-01-01', 0)`).run();
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (2, 4, 4, 4, 'Good', '2025-01-02', 0)`).run();
        db.prepare(`INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (3, 3, 3, 3, 'Okay', '2025-01-03', 0)`).run();

        userReviewModel = new UserReviewModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return review_id and user_id', function () {
            const result = userReviewModel.create(1, 1);

            assert.strictEqual(result.review_id, 1);
            assert.strictEqual(result.user_id, 1);
        });

        it('should allow a different user to have a different review', function () {
            const result = userReviewModel.create(2, 2);

            assert.strictEqual(result.review_id, 2);
            assert.strictEqual(result.user_id, 2);
        });

        it('should throw on duplicate review_id (PK constraint)', function () {
            assert.throws(() => {
                userReviewModel.create(1, 2);
            });
        });

        it('should throw when review_id does not exist in ReviewContent (FK violation)', function () {
            assert.throws(() => {
                userReviewModel.create(999, 1);
            });
        });

        it('should throw when user_id does not exist (FK violation)', function () {
            assert.throws(() => {
                userReviewModel.create(3, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row by review_id', function () {
            const result = userReviewModel.getById(1);

            assert.ok(result);
            assert.strictEqual(result.review_id, 1);
            assert.strictEqual(result.user_id, 1);
        });

        it('should return undefined for a non-existent review_id', function () {
            const result = userReviewModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = userReviewModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted rows', function () {
            const results = userReviewModel.getAll();

            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update the user_id and return the updated row', function () {
            userReviewModel.create(3, 1);
            const updated = userReviewModel.update(3, 2);

            assert.ok(updated);
            assert.strictEqual(updated.review_id, 3);
            assert.strictEqual(updated.user_id, 2);
        });

        it('should persist the update when re-fetched', function () {
            const fetched = userReviewModel.getById(3);

            assert.strictEqual(fetched.user_id, 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = userReviewModel.delete(3);

            assert.ok(deleted);
            assert.strictEqual(deleted.review_id, 3);
        });

        it('should remove the row from the database', function () {
            const result = userReviewModel.getById(3);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = userReviewModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
