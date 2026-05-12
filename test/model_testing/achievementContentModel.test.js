const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const AchievementContentModel = require('../../models/achievementContentModel');

describe('AchievementContentModel', function () {
    let db;
    let achievementContentModel;

    before(function () {
        db = connectTestDatabase();

        // Seed MetricContent (required FK)
        db.prepare(`INSERT INTO MetricContent (metric_id, metric_name) VALUES (1, 'jobs_completed')`).run();
        db.prepare(`INSERT INTO MetricContent (metric_id, metric_name) VALUES (2, 'reviews_written')`).run();

        // Seed BadgeContent (optional FK)
        db.prepare(`INSERT INTO BadgeContent (badge_id, badge_name, badge_image_link) VALUES (1, 'Gold Badge', 'gold.png')`).run();

        achievementContentModel = new AchievementContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new achievement with its id', function () {
            const result = achievementContentModel.create('First Job', 1, null, 1);

            assert.ok(result.id);
            assert.strictEqual(result.achievement_name, 'First Job');
            assert.strictEqual(result.metric_id, 1);
            assert.strictEqual(result.required_quantity, 1);
        });

        it('should allow a null badge_id', function () {
            const result = achievementContentModel.create('Five Jobs', 1, null, 5);

            assert.ok(result.id);
            assert.strictEqual(result.badge_id, null);
        });

        it('should allow a valid badge_id', function () {
            const result = achievementContentModel.create('Ten Jobs', 1, 1, 10);

            assert.ok(result.id);
            assert.strictEqual(result.badge_id, 1);
        });

        it('should throw on duplicate achievement_name (UNIQUE constraint)', function () {
            assert.throws(() => {
                achievementContentModel.create('First Job', 1, null, 1);
            });
        });

        it('should throw when metric_id does not exist (FK violation)', function () {
            assert.throws(() => {
                achievementContentModel.create('Unique Name', 999, null, 1);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = achievementContentModel.create('Unique Get Test', 1, null, 3);
            const result = achievementContentModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.achievement_id, created.id);
            assert.strictEqual(result.achievement_name, 'Unique Get Test');
        });

        it('should return undefined for a non-existent id', function () {
            const result = achievementContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByName()', function () {
        it('should return the correct row by name', function () {
            const result = achievementContentModel.getByName('First Job');

            assert.ok(result);
            assert.strictEqual(result.achievement_name, 'First Job');
        });

        it('should return undefined for a non-existent name', function () {
            const result = achievementContentModel.getByName('Does Not Exist');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = achievementContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted achievements', function () {
            const results = achievementContentModel.getAll();

            assert.ok(results.length >= 3);
        });

        it('every row should have required fields', function () {
            const results = achievementContentModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'achievement_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'achievement_name'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'metric_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'required_quantity'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = achievementContentModel.create('To Update', 1, null, 2);
            const updated = achievementContentModel.update(created.id, 'Updated Name', 2, null, 20);

            assert.strictEqual(updated.achievement_name, 'Updated Name');
            assert.strictEqual(updated.metric_id, 2);
            assert.strictEqual(updated.required_quantity, 20);
        });

        it('should persist the update when re-fetched', function () {
            const created = achievementContentModel.create('To Update Again', 1, null, 2);
            achievementContentModel.update(created.id, 'Persisted Update', 1, null, 99);
            const fetched = achievementContentModel.getById(created.id);

            assert.strictEqual(fetched.achievement_name, 'Persisted Update');
            assert.strictEqual(fetched.required_quantity, 99);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = achievementContentModel.create('To Delete', 1, null, 1);
            const deleted = achievementContentModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.achievement_id, created.id);
            assert.strictEqual(deleted.achievement_name, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const created = achievementContentModel.create('To Delete 2', 1, null, 1);
            achievementContentModel.delete(created.id);

            const result = achievementContentModel.getById(created.id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = achievementContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
