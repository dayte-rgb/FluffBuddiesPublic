const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const SkillCategoryModel = require('../../models/skillCategoryModel');

describe('SkillCategoryModel', function () {
    let db;
    let skillCategoryModel;

    before(function () {
        db = connectTestDatabase();
        skillCategoryModel = new SkillCategoryModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new category with its id', function () {
            const result = skillCategoryModel.create('Dog Training');

            assert.ok(result.id);
            assert.strictEqual(result.category_name, 'Dog Training');
        });

        it('should throw on duplicate category_name (UNIQUE constraint)', function () {
            assert.throws(() => {
                skillCategoryModel.create('Dog Training');
            });
        });

        it('should allow multiple distinct categories', function () {
            const result = skillCategoryModel.create('Cat Care');

            assert.ok(result.id);
            assert.strictEqual(result.category_name, 'Cat Care');
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = skillCategoryModel.create('Bird Handling');
            const result = skillCategoryModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.skill_category_id, created.id);
            assert.strictEqual(result.category_name, 'Bird Handling');
        });

        it('should return undefined for a non-existent id', function () {
            const result = skillCategoryModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByName()', function () {
        it('should return the correct row by name', function () {
            const result = skillCategoryModel.getByName('Dog Training');

            assert.ok(result);
            assert.strictEqual(result.category_name, 'Dog Training');
        });

        it('should return undefined for a non-existent name', function () {
            const result = skillCategoryModel.getByName('Does Not Exist');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = skillCategoryModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted categories', function () {
            const results = skillCategoryModel.getAll();

            assert.ok(results.length >= 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update category_name and return the updated row', function () {
            const created = skillCategoryModel.create('To Update');
            const updated = skillCategoryModel.update(created.id, 'Updated Skill');

            assert.ok(updated);
            assert.strictEqual(updated.skill_category_id, created.id);
            assert.strictEqual(updated.category_name, 'Updated Skill');
        });

        it('should persist the update when re-fetched', function () {
            const all = skillCategoryModel.getAll();
            const skill = all[all.length - 1];
            skillCategoryModel.update(skill.skill_category_id, 'Persisted Update');
            const fetched = skillCategoryModel.getById(skill.skill_category_id);

            assert.strictEqual(fetched.category_name, 'Persisted Update');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = skillCategoryModel.create('To Delete');
            const deleted = skillCategoryModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.skill_category_id, created.id);
            assert.strictEqual(deleted.category_name, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const created = skillCategoryModel.create('To Delete 2');
            skillCategoryModel.delete(created.id);

            const result = skillCategoryModel.getById(created.id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = skillCategoryModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
