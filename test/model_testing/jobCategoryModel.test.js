const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const JobCategoryModel = require('../../models/jobCategoryModel');

describe('JobCategoryModel', function () {
    let db;
    let jobCategoryModel;

    before(function () {
        db = connectTestDatabase();
        jobCategoryModel = new JobCategoryModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new category with its id', function () {
            const result = jobCategoryModel.create('Pet Care');

            assert.ok(result.id);
            assert.strictEqual(result.category_name, 'Pet Care');
        });

        it('should throw on duplicate category_name (UNIQUE constraint)', function () {
            assert.throws(() => {
                jobCategoryModel.create('Pet Care');
            });
        });

        it('should allow multiple distinct categories', function () {
            const result = jobCategoryModel.create('Transport');

            assert.ok(result.id);
            assert.strictEqual(result.category_name, 'Transport');
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = jobCategoryModel.create('Grooming');
            const result = jobCategoryModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.job_category_id, created.id);
            assert.strictEqual(result.category_name, 'Grooming');
        });

        it('should return undefined for a non-existent id', function () {
            const result = jobCategoryModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByName()', function () {
        it('should return the correct row by name', function () {
            const result = jobCategoryModel.getByName('Pet Care');

            assert.ok(result);
            assert.strictEqual(result.category_name, 'Pet Care');
        });

        it('should return undefined for a non-existent name', function () {
            const result = jobCategoryModel.getByName('Does Not Exist');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = jobCategoryModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted categories', function () {
            const results = jobCategoryModel.getAll();

            assert.ok(results.length >= 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update category_name and return the updated row', function () {
            const created = jobCategoryModel.create('To Update');
            const updated = jobCategoryModel.update(created.id, 'Updated Category');

            assert.ok(updated);
            assert.strictEqual(updated.job_category_id, created.id);
            assert.strictEqual(updated.category_name, 'Updated Category');
        });

        it('should persist the update when re-fetched', function () {
            const all = jobCategoryModel.getAll();
            const cat = all[all.length - 1];
            jobCategoryModel.update(cat.job_category_id, 'Persisted Update');
            const fetched = jobCategoryModel.getById(cat.job_category_id);

            assert.strictEqual(fetched.category_name, 'Persisted Update');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = jobCategoryModel.create('To Delete');
            const deleted = jobCategoryModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.job_category_id, created.id);
            assert.strictEqual(deleted.category_name, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const created = jobCategoryModel.create('To Delete 2');
            jobCategoryModel.delete(created.id);

            const result = jobCategoryModel.getById(created.id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = jobCategoryModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
