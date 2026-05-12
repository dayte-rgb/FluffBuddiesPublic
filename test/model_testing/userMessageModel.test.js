const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const UserMessageModel = require('../../models/userMessageModel');

describe('UserMessageModel', function () {
    let db;
    let userMessageModel;

    before(function () {
        db = connectTestDatabase();

        // Seed Users
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (1, 'alice', 'pw', '1111111111', 'alice@example.com', 10001, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (2, 'bob', 'pw', '2222222222', 'bob@example.com', 10002, 'user')`).run();
        db.prepare(`INSERT INTO User (user_id, username, password, phone_number, email, zipcode, account_type) VALUES (3, 'carol', 'pw', '3333333333', 'carol@example.com', 10003, 'user')`).run();

        // Seed MessageContent (required FK)
        db.prepare(`INSERT INTO MessageContent (message_id, message_content, datetime) VALUES (1, 'Hello', '2025-01-01 10:00')`).run();
        db.prepare(`INSERT INTO MessageContent (message_id, message_content, datetime) VALUES (2, 'Hi there', '2025-01-01 10:01')`).run();
        db.prepare(`INSERT INTO MessageContent (message_id, message_content, datetime) VALUES (3, 'Bye', '2025-01-01 10:02')`).run();

        userMessageModel = new UserMessageModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return message_id, sender_id, and recipient_id', function () {
            const result = userMessageModel.create(1, 1, 2);

            assert.strictEqual(result.message_id, 1);
            assert.strictEqual(result.sender_id, 1);
            assert.strictEqual(result.recipient_id, 2);
        });

        it('should throw on duplicate message_id (PK constraint)', function () {
            assert.throws(() => {
                userMessageModel.create(1, 2, 1);
            });
        });

        it('should throw when sender_id does not exist (FK violation)', function () {
            assert.throws(() => {
                userMessageModel.create(2, 999, 1);
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct row', function () {
            const result = userMessageModel.getById(1);

            assert.ok(result);
            assert.strictEqual(result.message_id, 1);
            assert.strictEqual(result.sender_id, 1);
            assert.strictEqual(result.recipient_id, 2);
        });

        it('should return undefined for a non-existent message_id', function () {
            const result = userMessageModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        before(function () {
            userMessageModel.create(2, 2, 1);
        });

        it('should return an array of all rows', function () {
            const results = userMessageModel.getAll();

            assert.ok(Array.isArray(results));
            assert.ok(results.length >= 2);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update sender_id and recipient_id and return the updated row', function () {
            userMessageModel.create(3, 1, 3);
            const updated = userMessageModel.update(3, 2, 1);

            assert.ok(updated);
            assert.strictEqual(updated.message_id, 3);
            assert.strictEqual(updated.sender_id, 2);
            assert.strictEqual(updated.recipient_id, 1);
        });

        it('should persist the update when re-fetched', function () {
            const fetched = userMessageModel.getById(3);

            assert.strictEqual(fetched.sender_id, 2);
            assert.strictEqual(fetched.recipient_id, 1);
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the row before deleting it', function () {
            const deleted = userMessageModel.delete(2);

            assert.ok(deleted);
            assert.strictEqual(deleted.message_id, 2);
        });

        it('should remove the row from the database', function () {
            const result = userMessageModel.getById(2);

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent id', function () {
            const result = userMessageModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
