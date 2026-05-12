const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const UserAchievementModel = require('../../models/userAchievementModel');

describe('UserAchievementModel', function () {
    let db;
    let userAchievementModel;

    before(function () {
        db = connectTestDatabase();

        // Seed a user required for foreign key constraints
        db.prepare(`
            INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type)
            VALUES (1, 'alice', 'hashed_pw', '1234567890', 'alice@example.com', 10001, 'user')
        `).run();

        db.prepare(`
            INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type)
            VALUES (2, 'bob', 'hashed_pw2', '0987654321', 'bob@example.com', 10002, 'user')
        `).run();

        // Seed MetricContent required by AchievementContent foreign key
        db.prepare(`
            INSERT INTO MetricContent (metric_id, metric_name)
            VALUES (1, 'jobs_completed')
        `).run();

        // Seed AchievementContent required for foreign key constraints
        db.prepare(`
            INSERT INTO AchievementContent (achievement_id, achievement_name, metric_id, required_quantity)
            VALUES (1, 'First Job', 1, 1)
        `).run();

        db.prepare(`
            INSERT INTO AchievementContent (achievement_id, achievement_name, metric_id, required_quantity)
            VALUES (2, 'Five Jobs', 1, 5)
        `).run();

        userAchievementModel = new UserAchievementModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert a UserAchievement and return the user_id and achievement_id', function () {
            const result = userAchievementModel.create(1, 1);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.achievement_id, 1);
        });

        it('should allow a different user to earn the same achievement', function () {
            const result = userAchievementModel.create(2, 1);

            assert.strictEqual(result.user_id, 2);
            assert.strictEqual(result.achievement_id, 1);
        });

        it('should allow the same user to earn a different achievement', function () {
            const result = userAchievementModel.create(1, 2);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.achievement_id, 2);
        });

        it('should throw when inserting a duplicate (user_id, achievement_id) pair', function () {
            assert.throws(() => {
                userAchievementModel.create(1, 1); // already inserted above
            });
        });

        it('should throw when user_id does not exist (foreign key violation)', function () {
            assert.throws(() => {
                userAchievementModel.create(999, 1);
            });
        });

        it('should throw when achievement_id does not exist (foreign key violation)', function () {
            assert.throws(() => {
                userAchievementModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return all UserAchievement rows', function () {
            const results = userAchievementModel.getAll();

            // We inserted (1,1), (2,1), (1,2) in the create() tests above
            assert.ok(Array.isArray(results));
            assert.strictEqual(results.length, 3);
        });

        it('every row should have user_id and achievement_id fields', function () {
            const results = userAchievementModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'user_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'achievement_id'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row when it exists', function () {
            const result = userAchievementModel.getByIds(1, 1);

            assert.ok(result);
            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.achievement_id, 1);
        });

        it('should return undefined when the row does not exist', function () {
            const result = userAchievementModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should remove the row from the database', function () {
            userAchievementModel.delete(2, 1);

            const remaining = userAchievementModel.getAll();
            const stillExists = remaining.some(r => r.user_id === 2 && r.achievement_id === 1);
            assert.ok(!stillExists);
        });

        it('should return the deleted row before removing it', function () {
            const result = userAchievementModel.delete(1, 2);

            assert.ok(result);
            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.achievement_id, 2);
        });

        it('should not throw when deleting a row that does not exist', function () {
            assert.doesNotThrow(() => {
                userAchievementModel.delete(999, 999);
            });
        });

        it('getAll() count should decrease after a successful delete', function () {
            const before = userAchievementModel.getAll().length;
            userAchievementModel.delete(1, 1);
            const after = userAchievementModel.getAll().length;

            assert.strictEqual(after, before - 1);
        });
    });
});