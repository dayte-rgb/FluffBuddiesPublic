const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const SkillCategoryByUserModel = require('../../models/skillCategoryByUserModel');

describe('SkillCategoryByUserModel', function () {
    let db;
    let skillCategoryByUserModel;

    before(function () {
        db = connectTestDatabase();

        // Seed User
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();

        // Seed SkillCategory
        db.prepare(`INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (1, 'Dog Training')`).run();
        db.prepare(`INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (2, 'Cat Care')`).run();

        skillCategoryByUserModel = new SkillCategoryByUserModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return user_id and skill_category_id', function () {
            const result = skillCategoryByUserModel.create(1, 1);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.skill_category_id, 1);
        });

        it('should allow the same user to have a different skill', function () {
            const result = skillCategoryByUserModel.create(1, 2);

            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.skill_category_id, 2);
        });

        it('should allow a different user to have the same skill', function () {
            const result = skillCategoryByUserModel.create(2, 1);

            assert.strictEqual(result.user_id, 2);
            assert.strictEqual(result.skill_category_id, 1);
        });

        it('should throw on duplicate (user_id, skill_category_id) pair', function () {
            assert.throws(() => {
                skillCategoryByUserModel.create(1, 1);
            });
        });

        it('should throw when user_id does not exist (FK violation)', function () {
            assert.throws(() => {
                skillCategoryByUserModel.create(999, 1);
            });
        });

        it('should throw when skill_category_id does not exist (FK violation)', function () {
            assert.throws(() => {
                skillCategoryByUserModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row', function () {
            const result = skillCategoryByUserModel.getByIds(1, 1);

            assert.ok(result);
            assert.strictEqual(result.user_id, 1);
            assert.strictEqual(result.skill_category_id, 1);
        });

        it('should return undefined when not found', function () {
            const result = skillCategoryByUserModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = skillCategoryByUserModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted rows', function () {
            const results = skillCategoryByUserModel.getAll();

            assert.strictEqual(results.length, 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = skillCategoryByUserModel.delete(1, 2);

            assert.ok(deleted);
            assert.strictEqual(deleted.user_id, 1);
            assert.strictEqual(deleted.skill_category_id, 2);
        });

        it('should remove the row from the database', function () {
            const result = skillCategoryByUserModel.getByIds(1, 2);

            assert.strictEqual(result, undefined);
        });

        it('should not throw when deleting a non-existent row', function () {
            assert.doesNotThrow(() => {
                skillCategoryByUserModel.delete(999, 999);
            });
        });

        it('getAll() count should decrease after a successful delete', function () {
            const before = skillCategoryByUserModel.getAll().length;
            skillCategoryByUserModel.delete(2, 1);
            const after = skillCategoryByUserModel.getAll().length;

            assert.strictEqual(after, before - 1);
        });
    });
});
