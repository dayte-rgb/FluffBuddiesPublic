'use strict';

const assert = require('assert');
const bcrypt = require('bcrypt');
const { connectTestDatabase } = require('./helpers/testDatabase');

// ─── Dependency-injected version of userModel ────────────────────────────────

class UserModel {
  constructor(db) {
    this.db = db;
  }

  async create(username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = this.db.prepare(
      'INSERT INTO User (user_id, username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(username, hashedPassword, phone_number, email, zipcode, profile_description, account_type, profile_picture_link);
    return { id: info.lastInsertRowid, username, password: hashedPassword, phone_number, email, zipcode, profile_description, account_type, profile_picture_link };
  }

  getById(user_id) {
    return this.db.prepare('SELECT * FROM User WHERE user_id = ?').get(user_id);
  }

  getByUsername(username) {
    return this.db.prepare('SELECT * FROM User WHERE username = ?').get(username);
  }

  getByEmail(email) {
    return this.db.prepare('SELECT * FROM User WHERE email = ?').get(email);
  }

  getAll() {
    return this.db.prepare('SELECT * FROM User').all();
  }

  update(user_id, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) {
    this.db
      .prepare(
        'UPDATE User SET password = ?, phone_number = ?, email = ?, zipcode = ?, profile_description = ?, account_type = ?, profile_picture_link = ? WHERE user_id = ?'
      )
      .run(password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link, user_id);
    return this.getById(user_id);
  }

  delete(user_id) {
    const old = this.getById(user_id);
    this.db.prepare('DELETE FROM User WHERE user_id = ?').run(user_id);
    return old;
  }

  async authenticate(identifier, password) {
    let u = this.getByUsername(identifier);
    if (!u) u = this.getByEmail(identifier);
    if (u && await bcrypt.compare(password, u.password)) return u;
    return null;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('UserModel – database model tests', function () {
  this.timeout(10000);

  let db;
  let userModel;

  // Counter keeps usernames/emails unique across all tests in this file
  let counter = 0;
  function uniqueUser(prefix = 'user') {
    counter++;
    return {
      username:   `${prefix}_${counter}`,
      password:   'Password123!',
      phone:      `555-000-${String(counter).padStart(4, '0')}`,
      email:      `${prefix}_${counter}@example.com`,
      zipcode:    '10001',
      bio:        'Test bio',
      type:       'user',
      pic:        null,
    };
  }

  before(function () {
    db = connectTestDatabase();
    userModel = new UserModel(db);
  });

  after(function () {
    db.close();
  });

  // ── CREATE ────────────────────────────────────────────────────────────────

  describe('create()', function () {
    it('should insert a new user and return an object with a numeric id', async function () {
      const u = uniqueUser();
      const result = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      assert.ok(result.id, 'Returned object should have a truthy id');
      assert.strictEqual(typeof result.id, 'number');
      assert.strictEqual(result.username, u.username);
      assert.strictEqual(result.email,    u.email);
    });

    it('should hash the password before storing it', async function () {
      const u = uniqueUser();
      const result = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      assert.notStrictEqual(result.password, u.password, 'Stored password should be hashed');
      const match = await bcrypt.compare(u.password, result.password);
      assert.ok(match, 'bcrypt.compare should confirm the hash matches the original password');
    });

    it('should persist the user so it can be found in the database', async function () {
      const u = uniqueUser();
      const result = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const row = db.prepare('SELECT * FROM User WHERE user_id = ?').get(result.id);
      assert.ok(row, 'User row should exist in the database');
      assert.strictEqual(row.username, u.username);
      assert.strictEqual(row.email,    u.email);
    });
  });

  // ── READ ──────────────────────────────────────────────────────────────────

  describe('getById()', function () {
    it('should return the correct user for a valid id', async function () {
      const u = uniqueUser();
      const created = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);
      const fetched  = userModel.getById(created.id);

      assert.ok(fetched, 'getById should return a row');
      assert.strictEqual(fetched.user_id,  created.id);
      assert.strictEqual(fetched.username, u.username);
    });

    it('should return undefined for a non-existent id', function () {
      const result = userModel.getById(999999);
      assert.strictEqual(result, undefined);
    });
  });

  describe('getByUsername()', function () {
    it('should find a user by their username', async function () {
      const u = uniqueUser('findme');
      await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const found = userModel.getByUsername(u.username);
      assert.ok(found, 'Should find user by username');
      assert.strictEqual(found.username, u.username);
    });

    it('should return undefined for an unknown username', function () {
      assert.strictEqual(userModel.getByUsername('ghost_user_xyz'), undefined);
    });
  });

  describe('getByEmail()', function () {
    it('should find a user by their email address', async function () {
      const u = uniqueUser('email');
      await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const found = userModel.getByEmail(u.email);
      assert.ok(found, 'Should find user by email');
      assert.strictEqual(found.email, u.email);
    });

    it('should return undefined for an unknown email', function () {
      assert.strictEqual(userModel.getByEmail('ghost@nowhere.com'), undefined);
    });
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────

  describe('update()', function () {
    it('should update phone_number and return the refreshed row', async function () {
      const u = uniqueUser('upd');
      const created = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const newPhone = '555-999-0000';
      const updated  = userModel.update(created.id, created.password, newPhone, u.email, u.zipcode, u.bio, u.type, u.pic);

      assert.ok(updated, 'update() should return the updated row');
      assert.strictEqual(updated.phone_number, newPhone);
    });

    it('should update profile_description and persist to the database', async function () {
      const u = uniqueUser('bio');
      const created = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      userModel.update(created.id, created.password, u.phone, u.email, u.zipcode, 'New bio text', u.type, u.pic);
      const row = userModel.getById(created.id);
      assert.strictEqual(row.profile_description, 'New bio text');
    });
  });

  // ── DELETE ────────────────────────────────────────────────────────────────

  describe('delete()', function () {
    it('should delete the user and return the deleted row data', async function () {
      const u = uniqueUser('del');
      const created = await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);
      const deleted  = userModel.delete(created.id);

      assert.ok(deleted, 'delete() should return the deleted user data');
      assert.strictEqual(deleted.user_id, created.id);

      const afterDelete = userModel.getById(created.id);
      assert.strictEqual(afterDelete, undefined, 'User should no longer exist after deletion');
    });
  });

  // ── AUTHENTICATE ─────────────────────────────────────────────────────────

  describe('authenticate()', function () {
    it('should return the user when the correct username + password are supplied', async function () {
      const u = uniqueUser('auth');
      await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const result = await userModel.authenticate(u.username, u.password);
      assert.ok(result, 'authenticate() should return the user on correct credentials');
      assert.strictEqual(result.username, u.username);
    });

    it('should return the user when the correct email + password are supplied', async function () {
      const u = uniqueUser('authmail');
      await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const result = await userModel.authenticate(u.email, u.password);
      assert.ok(result, 'Should authenticate via email as well as username');
    });

    it('should return null for a wrong password', async function () {
      const u = uniqueUser('wrongpw');
      await userModel.create(u.username, u.password, u.phone, u.email, u.zipcode, u.bio, u.type, u.pic);

      const result = await userModel.authenticate(u.username, 'WrongPassword!');
      assert.strictEqual(result, null, 'authenticate() should return null on wrong password');
    });

    it('should return null for a non-existent user', async function () {
      const result = await userModel.authenticate('nobody_xyz', 'irrelevant');
      assert.strictEqual(result, null);
    });
  });
});
