const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const UserBadgeModel = require('../../models/userBadgeModel');

describe('UserBadgeModel', function () {
    let db;
    let userBadgeModel;

    before(function () {
        db = connectTestDatabase();

        // Seed Users
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();

        // Seed BadgeContent
        db.prepare(`INSERT INTO BadgeContent (badge_id, badge_name, badge_image_link) VALUES (1, 'Gold Badge', 'gold.png')`).run();
        db.prepare(`INSERT INTO BadgeContent (badge_id, badge_name, badge_image_link) VALUES (2, 'Silver Badge', 'silver.png')`).run();

        userBadgeModel = new UserBadgeModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return user_id and badge_id', function () {
            const result = userBadgeModel.create(1, 1);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.badge_id, 1);
        });

        it('should allow different user to earn the same badge', function () {
            const result = userBadgeModel.create(2, 1);

            assert.strictEqual(result.user_id, 2);
            assert.strictEqual(result.badge_id, 1);
        });

        it('should allow same user to earn a different badge', function () {
            const result = userBadgeModel.create(1, 2);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.badge_id, 2);
        });

        it('should throw on duplicate (user_id, badge_id) pair', function () {
            assert.throws(() => {
                userBadgeModel.create(1, 1);
            });
        });

        it('should throw when user_id does not exist (FK violation)', function () {
            assert.throws(() => {
                userBadgeModel.create(999, 1);
            });
        });

        it('should throw when badge_id does not exist (FK violation)', function () {
            assert.throws(() => {
                userBadgeModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row', function () {
            const result = userBadgeModel.getByIds(1, 1);

            assert.ok(result);
            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.badge_id, 1);
        });

        it('should return undefined when not found', function () {
            const result = userBadgeModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByUserId()', function () {
        it('should return all badges for the given user', function () {
            const results = userBadgeModel.getByUserId(1);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 2);
            results.forEach(row => {
                assert.strictEqual(row.user_id, 1);
            });
        });

        it('should return an empty array for a user with no badges', function () {
            const results = userBadgeModel.getByUserId(99999);

            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 0);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array of all rows', function () {
            const results = userBadgeModel.getAll();

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = userBadgeModel.delete(2, 1);

            assert.ok(deleted);
            assert.strictEqual(deleted.user_id, 2);
            assert.strictEqual(deleted.badge_id, 1);
        });

        it('should remove the row from the database', function () {
            const result = userBadgeModel.getByIds(2, 1);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent row', function () {
            const result = userBadgeModel.delete(999, 999);

            assert.strictEqual(result, undefined);
        });
    });
});
