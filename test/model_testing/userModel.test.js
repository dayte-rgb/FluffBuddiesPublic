const assert = require('assert');
const { connectTestDatabase } = require('../../test-database');
const UserModel = require('../../models/userModel');

describe('UserModel', function () {
    let db;
    let userModel;

    before(function () {
        db = connectTestDatabase();
        userModel = new UserModel(db);
    });

    after(function () {
        db.close();
    });

    // -----------------------------------------------------------------------
    describe('create()', function () {
        it('should insert and return the new user with a hashed password', async function () {
            const result = await userModel.create('alice', 'password123', '1111111111', 'alice@example.com', 10001, 'Bio here', 'user', null);

            assert.ok(result.id);
            assert.strictEqual(result.username, 'alice');
            assert.notStrictEqual(result.password, 'password123'); // should be hashed
            assert.strictEqual(result.email, 'alice@example.com');
        });

        it('should throw on duplicate username (UNIQUE constraint)', async function () {
            await assert.rejects(async () => {
                await userModel.create('alice', 'password123', '2222222222', 'other@example.com', 10001, '', 'user', null);
            });
        });

        it('should throw on duplicate email (UNIQUE constraint)', async function () {
            await assert.rejects(async () => {
                await userModel.create('uniqueuser', 'password123', '3333333333', 'alice@example.com', 10001, '', 'user', null);
            });
        });

        it('should throw on invalid account_type (CHECK constraint)', async function () {
            await assert.rejects(async () => {
                await userModel.create('newuser', 'password123', '4444444444', 'new@example.com', 10001, '', 'admin', null);
            });
        });

        it('should allow all valid account types', async function () {
            for (const [type, phone, email] of [
                ['pet', '5555555551', 'pet@example.com'],
                ['owner', '5555555552', 'owner@example.com'],
                ['organization', '5555555553', 'org@example.com'],
            ]) {
                const result = await userModel.create(`user_${type}`, 'pw', phone, email, 10001, '', type, null);
                assert.strictEqual(result.account_type, type);
            }
        });
    });

    // -----------------------------------------------------------------------
    describe('getById()', function () {
        it('should return the correct user', function () {
            const all = userModel.getAll();
            const user = all[0];
            const result = userModel.getById(user.user_id);

            assert.ok(result);
            assert.strictEqual(result.user_id, user.user_id);
            assert.strictEqual(result.username, user.username);
        });

        it('should return undefined for a non-existent id', function () {
            const result = userModel.getById(99999);

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByUsername()', function () {
        it('should return the correct user', function () {
            const result = userModel.getByUsername('alice');

            assert.ok(result);
            assert.strictEqual(result.username, 'alice');
        });

        it('should return undefined for a non-existent username', function () {
            const result = userModel.getByUsername('doesnotexist');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByEmail()', function () {
        it('should return the correct user', function () {
            const result = userModel.getByEmail('alice@example.com');

            assert.ok(result);
            assert.strictEqual(result.email, 'alice@example.com');
        });

        it('should return undefined for a non-existent email', function () {
            const result = userModel.getByEmail('nobody@example.com');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getByPhoneNumber()', function () {
        it('should return the correct user', function () {
            const result = userModel.getByPhoneNumber('1111111111');

            assert.ok(result);
            assert.strictEqual(result.phone_number, '1111111111');
        });

        it('should return undefined for a non-existent phone number', function () {
            const result = userModel.getByPhoneNumber('0000000000');

            assert.strictEqual(result, undefined);
        });
    });

    // -----------------------------------------------------------------------
    describe('getAll()', function () {
        it('should return an array', function () {
            const results = userModel.getAll();

            assert.ok(Array.isArray(results));
        });

        it('should return all inserted users', function () {
            const results = userModel.getAll();

            assert.ok(results.length >= 1);
        });

        it('every row should have required fields', function () {
            const results = userModel.getAll();

            results.forEach(row => {
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'user_id'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'username'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'email'));
                assert.ok(Object.prototype.hasOwnProperty.call(row, 'account_type'));
            });
        });
    });

    // -----------------------------------------------------------------------
    describe('authenticate()', function () {
        it('should return the user when authenticated by username', async function () {
            const result = await userModel.authenticate('alice', 'password123');

            assert.ok(result);
            assert.strictEqual(result.username, 'alice');
        });

        it('should return the user when authenticated by email', async function () {
            const result = await userModel.authenticate('alice@example.com', 'password123');

            assert.ok(result);
            assert.strictEqual(result.email, 'alice@example.com');
        });

        it('should return null for a wrong password', async function () {
            const result = await userModel.authenticate('alice', 'wrongpassword');

            assert.strictEqual(result, null);
        });

        it('should return null for a non-existent user', async function () {
            const result = await userModel.authenticate('nobody', 'password123');

            assert.strictEqual(result, null);
        });
    });

    // -----------------------------------------------------------------------
    describe('update()', function () {
        it('should update user fields and return the updated row', async function () {
            const user = userModel.getByUsername('alice');
            const updated = userModel.update(user.user_id, user.password, '9999999999', 'alice_new@example.com', 20002, 'New bio', 'owner', 'pic.png');

            assert.ok(updated);
            assert.strictEqual(updated.phone_number, '9999999999');
            assert.strictEqual(updated.email, 'alice_new@example.com');
            assert.strictEqual(updated.account_type, 'owner');
        });

        it('should persist the update when re-fetched', function () {
            const user = userModel.getByEmail('alice_new@example.com');
            const fetched = userModel.getById(user.user_id);

            assert.strictEqual(fetched.profile_description, 'New bio');
        });
    });

    // -----------------------------------------------------------------------
    describe('delete()', function () {
        it('should return the user before deleting', async function () {
            const created = await userModel.create('todelete', 'pw', '7777777777', 'del@example.com', 10001, '', 'user', null);
            const deleted = userModel.delete(created.id);

            assert.ok(deleted);
            assert.strictEqual(deleted.username, 'todelete');
        });

        it('should remove the user from the database', function () {
            const result = userModel.getByUsername('todelete');

            assert.strictEqual(result, undefined);
        });

        it('should return undefined when deleting a non-existent user', function () {
            const result = userModel.delete(99999);

            assert.strictEqual(result, undefined);
        });
    });
});
