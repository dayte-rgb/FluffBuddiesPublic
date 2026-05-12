const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const MessageContentModel = require('../../models/messageContentModel');

describe('MessageContentModel', function () {
    let db;
    let messageContentModel;

    before(function () {
        db = connectTestDatabase();
        messageContentModel = new MessageContentModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the full message row including message_id and datetime', function () {
            const result = messageContentModel.create('Hello world');

            assert.ok(result.message_id);
            assert.strictEqual(result.message_content, 'Hello world');
            assert.ok(result.datetime);
        });

        it('should create multiple messages with unique ids', function () {
            const a = messageContentModel.create('Message A');
            const b = messageContentModel.create('Message B');

            assert.notStrictEqual(a.message_id, b.message_id);
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const created = messageContentModel.create('Fetch me');
            const result = messageContentModel.getById(created.message_id);

            assert.ok(result);
            assert.strictEqual(result.message_id, created.message_id);
            assert.strictEqual(result.message_content, 'Fetch me');
        });

        it('should return undefined for a non-existent id', function () {
            const result = messageContentModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = messageContentModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted messages', function () {
            const results = messageContentModel.getAll();

            assert.ok(results.length >= 3);
        });

        it('every row should have message_id, message_content, and datetime', function () {
            const results = messageContentModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'message_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'message_content'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'datetime'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update fields and return the updated row', function () {
            const created = messageContentModel.create('Original');
            const updated = messageContentModel.update(created.message_id, 'Updated', '2025-01-01 12:00:00');

            assert.ok(updated);
            assert.strictEqual(updated.message_content, 'Updated');
            assert.strictEqual(updated.datetime, '2025-01-01 12:00:00');
        });

        it('should persist the update when re-fetched', function () {
            const created = messageContentModel.create('To Persist');
            messageContentModel.update(created.message_id, 'Persisted', '2025-06-01 08:00:00');
            const fetched = messageContentModel.getById(created.message_id);

            assert.strictEqual(fetched.message_content, 'Persisted');
            assert.strictEqual(fetched.datetime, '2025-06-01 08:00:00');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const created = messageContentModel.create('To Delete');
            const deleted = messageContentModel.delete(created.message_id);

            assert.ok(deleted);
            assert.strictEqual(deleted.message_id, created.message_id);
            assert.strictEqual(deleted.message_content, 'To Delete');
        });

        it('should remove the row from the database', function () {
            const created = messageContentModel.create('To Delete 2');
            messageContentModel.delete(created.message_id);

            const result = messageContentModel.getById(created.message_id);
            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = messageContentModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
