const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const SkillCategoriesByJobModel = require('../../models/skillCategoriesByJobModel');

describe('SkillCategoriesByJobModel', function () {
    let db;
    let skillCategoriesByJobModel;

    before(function () {
        db = connectTestDatabase();

        // Seed JobContent
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (1, 'Dog walking', '2025-01-01 09:00', 60, 10001, 1, 0, 0)`).run();
        db.prepare(`INSERT INTO JobContent (job_id, description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (2, 'Cat sitting', '2025-01-02 10:00', 120, 10002, 1, 0, 0)`).run();

        // Seed SkillCategory
        db.prepare(`INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (1, 'Dog Training')`).run();
        db.prepare(`INSERT INTO SkillCategory (skill_category_id, category_name) VALUES (2, 'Cat Care')`).run();

        skillCategoriesByJobModel = new SkillCategoriesByJobModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return job_id and skill_category_id', function () {
            const result = skillCategoriesByJobModel.create(1, 1);

            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.skill_category_id, 1);
        });

        it('should allow the same skill on a different job', function () {
            const result = skillCategoriesByJobModel.create(2, 1);

            assert.strictEqual(result.job_id, 2);
            assert.strictEqual(result.skill_category_id, 1);
        });

        it('should throw on duplicate (job_id, skill_category_id) pair', function () {
            assert.throws(() => {
                skillCategoriesByJobModel.create(1, 1);
            });
        });

        it('should throw when job_id does not exist (FK violation)', function () {
            assert.throws(() => {
                skillCategoriesByJobModel.create(999, 1);
            });
        });

        it('should throw when skill_category_id does not exist (FK violation)', function () {
            assert.throws(() => {
                skillCategoriesByJobModel.create(1, 999);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getByIds()', function () {
        it('should return the correct row', function () {
            const result = skillCategoriesByJobModel.getByIds(1, 1);

            assert.ok(result);
            assert.strictEqual(result.job_id, 1);
            assert.strictEqual(result.skill_category_id, 1);
        });

        it('should return undefined when not found', function () {
            const result = skillCategoriesByJobModel.getByIds(999, 999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = skillCategoriesByJobModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted rows', function () {
            const results = skillCategoriesByJobModel.getAll();

            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = skillCategoriesByJobModel.delete(2, 1);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_id, 2);
            assert.strictEqual(deleted.skill_category_id, 1);
        });

        it('should remove the row from the database', function () {
            const result = skillCategoriesByJobModel.getByIds(2, 1);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent row', function () {
            const result = skillCategoriesByJobModel.delete(999, 999);

            assert.strictEqual(result, undefined);
        });
    });
});
