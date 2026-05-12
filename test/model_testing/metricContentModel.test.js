const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const MetricContentModel = require('../../models/metricContentModel');

describe('MetricContentModel', function () {
    let db;
    let metricContentModel;

    before(function () {
        db = connectTestDatabase();
        metricContentModel = new MetricContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new metric with its id', function () {
            const result = metricContentModel.create('jobs_completed', 'Number of jobs completed');

            assert.ok(result.id);
            assert.strictEqual(result.metric_name, 'jobs_completed');
            assert.strictEqual(result.description, 'Number of jobs completed');
        });

        it('should allow a null description', function () {
            const result = metricContentModel.create('reviews_written', null);

            assert.ok(result.id);
            assert.strictEqual(result.metric_name, 'reviews_written');
        });

        it('should throw on duplicate metric_name (UNIQUE constraint)', function () {
            assert.throws(() => {
                metricContentModel.create('jobs_completed', 'Duplicate');
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = metricContentModel.create('reviews_received', 'Reviews received by user');
            const result = metricContentModel.getById(created.id);

            assert.ok(result);
            assert.strictEqual(result.metric_id, created.id);
            assert.strictEqual(result.metric_name, 'reviews_received');
        });

        it('should return undefined for a non-existent id', function () {
            const result = metricContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByName()', function () {
        it('should return the correct row by name', function () {
            const result = metricContentModel.getByName('jobs_completed');

            assert.ok(result);
            assert.strictEqual(result.metric_name, 'jobs_completed');
        });

        it('should return undefined for a non-existent name', function () {
            const result = metricContentModel.getByName('does_not_exist');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = metricContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted metrics', function () {
            const results = metricContentModel.getAll();

            assert.ok(results.length >= 3);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = metricContentModel.create('to_update', 'Original description');
            const updated = metricContentModel.update(created.id, 'updated_metric', 'Updated description');

            assert.ok(updated);
            assert.strictEqual(updated.metric_name, 'updated_metric');
            assert.strictEqual(updated.description, 'Updated description');
        });

        it('should persist the update when re-fetched', function () {
            const all = metricContentModel.getAll();
            const metric = all[all.length - 1];
            metricContentModel.update(metric.metric_id, 'persisted_metric', 'Persisted description');
            const fetched = metricContentModel.getById(metric.metric_id);

            assert.strictEqual(fetched.metric_name, 'persisted_metric');
            assert.strictEqual(fetched.description, 'Persisted description');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = metricContentModel.create('to_delete', 'Will be deleted');
            const deleted = metricContentModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.metric_id, created.id);
            assert.strictEqual(deleted.metric_name, 'to_delete');
        });

        it('should remove the row from the database', function () {
            const created = metricContentModel.create('to_delete_2', null);
            metricContentModel.delete(created.id);

            const result = metricContentModel.getById(created.id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = metricContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
