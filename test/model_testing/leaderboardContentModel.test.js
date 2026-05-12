const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const LeaderboardContentModel = require('../../models/leaderboardContentModel');

describe('LeaderboardContentModel', function () {
    let db;
    let leaderboardContentModel;

    before(function () {
        db = connectTestDatabase();

        // Seed MetricContent (required FK)
        db.prepare(`INSERT INTO MetricContent (metric_id, metric_name) VALUES (1, 'jobs_completed')`).run();

        // Seed BadgeContent (optional FK)
        db.prepare(`INSERT INTO BadgeContent (badge_id, badge_name, badge_image_link) VALUES (1, 'Gold Badge', 'gold.png')`).run();

        leaderboardContentModel = new LeaderboardContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new leaderboard with its id', function () {
            const result = leaderboardContentModel.create('2025-01-01 00:00:00', '2025-02-01 00:00:00', 1, 1);

            assert.ok(result.id);
            assert.strictEqual(result.start_time, '2025-01-01 00:00:00');
            assert.strictEqual(result.end_time, '2025-02-01 00:00:00');
            assert.strictEqual(result.metric_id, 1);
            assert.strictEqual(result.badge_id, 1);
        });

        it('should allow null end_time', function () {
            const result = leaderboardContentModel.create('2025-03-01 00:00:00', null, 1, null);

            assert.ok(result.id);
            assert.strictEqual(result.end_time, null);
        });

        it('should throw when metric_id does not exist (FK violation)', function () {
            assert.throws(() => {
                leaderboardContentModel.create('2025-01-01', '2025-02-01', 999, null);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = leaderboardContentModel.create('2025-04-01 00:00:00', null, 1, null);
            const result = leaderboardContentModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.leaderboard_id, created.id);
            assert.strictEqual(result.start_time, '2025-04-01 00:00:00');
        });

        it('should return undefined for a non-existent id', function () {
            const result = leaderboardContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = leaderboardContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should contain all inserted leaderboards', function () {
            const results = leaderboardContentModel.getAll();

            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = leaderboardContentModel.create('2025-05-01 00:00:00', null, 1, null);
            const updated = leaderboardContentModel.update(created.id, '2025-05-01 00:00:00', '2025-06-01 00:00:00', 1, 1);

            assert.ok(updated);
            assert.strictEqual(updated.end_time, '2025-06-01 00:00:00');
            assert.strictEqual(updated.badge_id, 1);
        });

        it('should persist the update when re-fetched', function () {
            const all = leaderboardContentModel.getAll();
            const lb = all[all.length - 1];
            leaderboardContentModel.update(lb.leaderboard_id, lb.start_time, '2099-01-01 00:00:00', 1, null);
            const fetched = leaderboardContentModel.getById(lb.leaderboard_id);

            assert.strictEqual(fetched.end_time, '2099-01-01 00:00:00');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = leaderboardContentModel.create('2025-07-01 00:00:00', null, 1, null);
            const deleted = leaderboardContentModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.leaderboard_id, created.id);
        });

        it('should remove the row from the database', function () {
            const all = leaderboardContentModel.getAll();
            const lb = all[all.length - 1];
            leaderboardContentModel.delete(lb.leaderboard_id);

            const result = leaderboardContentModel.getById(lb.leaderboard_id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = leaderboardContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
