const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const ReviewContentModel = require('../../models/reviewContentModel');

describe('ReviewContentModel', function () {
    let db;
    let reviewContentModel;

    before(function () {
        db = connectTestDatabase();
        reviewContentModel = new ReviewContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new review with its id', function () {
            const result = reviewContentModel.create(5, 4, 3, 'Great job', '2025-01-01', 0);

            assert.ok(result.id);
            assert.strictEqual(result.punctuality, 5);
            assert.strictEqual(result.quality, 4);
            assert.strictEqual(result.friendliness, 3);
            assert.strictEqual(result.comments, 'Great job');
            assert.strictEqual(result.verified, 0);
        });

        it('should allow verified = 1', function () {
            const result = reviewContentModel.create(3, 3, 3, null, '2025-01-02', 1);

            assert.strictEqual(result.verified, 1);
        });

        it('should throw when punctuality is out of range (CHECK constraint)', function () {
            assert.throws(() => {
                reviewContentModel.create(6, 3, 3, null, '2025-01-03', 0);
            });
        });

        it('should throw when quality is out of range (CHECK constraint)', function () {
            assert.throws(() => {
                reviewContentModel.create(3, 6, 3, null, '2025-01-03', 0);
            });
        });

        it('should throw when friendliness is out of range (CHECK constraint)', function () {
            assert.throws(() => {
                reviewContentModel.create(3, 3, 6, null, '2025-01-03', 0);
            });
        });

        it('should throw when verified is not 0 or 1 (CHECK constraint)', function () {
            assert.throws(() => {
                reviewContentModel.create(3, 3, 3, null, '2025-01-03', 2);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = reviewContentModel.create(5, 5, 5, 'Perfect', '2025-02-01', 0);
            const result = reviewContentModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.review_id, created.id);
            assert.strictEqual(result.comments, 'Perfect');
        });

        it('should return undefined for a non-existent id', function () {
            const result = reviewContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = reviewContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted reviews', function () {
            const results = reviewContentModel.getAll();

            assert.ok(results.length >= 2);
        });

        it('every row should have all required fields', function () {
            const results = reviewContentModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'review_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'punctuality'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'quality'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'friendliness'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'verified'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = reviewContentModel.create(1, 1, 1, 'Bad', '2025-03-01', 0);
            const updated = reviewContentModel.update(created.id, 5, 5, 5, 'Actually great', '2025-03-02', 1);

            assert.ok(updated);
            assert.strictEqual(updated.punctuality, 5);
            assert.strictEqual(updated.comments, 'Actually great');
            assert.strictEqual(updated.verified, 1);
        });

        it('should persist the update when re-fetched', function () {
            const all = reviewContentModel.getAll();
            const review = all[all.length - 1];
            reviewContentModel.update(review.review_id, 2, 2, 2, 'Changed again', '2025-04-01', 0);
            const fetched = reviewContentModel.getById(review.review_id);

            assert.strictEqual(fetched.comments, 'Changed again');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = reviewContentModel.create(3, 3, 3, 'To Delete', '2025-05-01', 0);
            const deleted = reviewContentModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.review_id, created.id);
            assert.strictEqual(deleted.comments, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const created = reviewContentModel.create(3, 3, 3, 'To Delete 2', '2025-05-02', 0);
            reviewContentModel.delete(created.id);

            const result = reviewContentModel.getById(created.id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = reviewContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
