const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const BadgeContentModel = require('../../models/badgeContentModel');

describe('BadgeContentModel', function () {
    let db;
    let badgeContentModel;

    before(function () {
        db = connectTestDatabase();
        badgeContentModel = new BadgeContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new badge with its id', function () {
            const result = badgeContentModel.create('Gold Badge', 'gold.png');

            assert.ok(result.id);
            assert.strictEqual(result.badge_name, 'Gold Badge');
            assert.strictEqual(result.badge_image_link, 'gold.png');
        });

        it('should throw on duplicate badge_name (UNIQUE constraint)', function () {
            assert.throws(() => {
                badgeContentModel.create('Gold Badge', 'gold2.png');
            });
        });

        it('should throw on duplicate badge_image_link (UNIQUE constraint)', function () {
            assert.throws(() => {
                badgeContentModel.create('Different Name', 'gold.png');
            });
        });

        it('should allow multiple distinct badges', function () {
            const result = badgeContentModel.create('Silver Badge', 'silver.png');

            assert.ok(result.id);
            assert.strictEqual(result.badge_name, 'Silver Badge');
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = badgeContentModel.create('Bronze Badge', 'bronze.png');
            const result = badgeContentModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.badge_id, created.id);
            assert.strictEqual(result.badge_name, 'Bronze Badge');
            assert.strictEqual(result.badge_image_link, 'bronze.png');
        });

        it('should return undefined for a non-existent id', function () {
            const result = badgeContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByName()', function () {
        it('should return the correct row by name', function () {
            const result = badgeContentModel.getByName('Gold Badge');

            assert.ok(result);
            assert.strictEqual(result.badge_name, 'Gold Badge');
        });

        it('should return undefined for a non-existent name', function () {
            const result = badgeContentModel.getByName('Does Not Exist');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = badgeContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted badges', function () {
            const results = badgeContentModel.getAll();

            assert.ok(results.length >= 3);
        });

        it('every row should have badge_id, badge_name, and badge_image_link fields', function () {
            const results = badgeContentModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'badge_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'badge_name'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'badge_image_link'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = badgeContentModel.create('To Update', 'toupdate.png');
            const updated = badgeContentModel.update(created.id, 'Updated Badge', 'updated.png');

            assert.ok(updated);
            assert.strictEqual(updated.badge_name, 'Updated Badge');
            assert.strictEqual(updated.badge_image_link, 'updated.png');
        });

        it('should persist the update when re-fetched', function () {
            const all = badgeContentModel.getAll();
            const badge = all[all.length - 1];
            badgeContentModel.update(badge.badge_id, 'Persisted Badge', 'persisted.png');
            const fetched = badgeContentModel.getById(badge.badge_id);

            assert.strictEqual(fetched.badge_name, 'Persisted Badge');
            assert.strictEqual(fetched.badge_image_link, 'persisted.png');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = badgeContentModel.create('To Delete', 'todelete.png');
            const deleted = badgeContentModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.badge_id, created.id);
            assert.strictEqual(deleted.badge_name, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const created = badgeContentModel.create('To Delete 2', 'todelete2.png');
            badgeContentModel.delete(created.id);

            const result = badgeContentModel.getById(created.id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = badgeContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
