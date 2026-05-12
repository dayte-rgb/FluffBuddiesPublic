/**
 * test/reviewContent-model-test.js
 *
 * Tests for reviewContentModel (ReviewContent table).
 * Covers: create, getById, getAll, update, delete.
 *
 * Run: npm test  OR  npm test -- test/reviewContent-model-test.js
 */

'use strict';

const assert = require('assert');
const { connectTestDatabase } = require('./helpers/testDatabase');

// ─── Inline model (dependency-injected version) ──────────────────────────────
// We re-implement the model to accept a `db` argument so the test can
// supply an in-memory database instead of the production one.
// This mirrors exactly what the lab instructions ask you to do with your
// real model class.

class ReviewContentModel {
  constructor(db) {
    this.db = db;
  }

  create(punctuality, quality, friendliness, comments, datetime, verified) {
    const stmt = this.db.prepare(
      'INSERT INTO ReviewContent (review_id, punctuality, quality, friendliness, comments, datetime, verified) VALUES (NULL, ?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(punctuality, quality, friendliness, comments, datetime, verified);
    return { id: info.lastInsertRowid, punctuality, quality, friendliness, comments, datetime, verified };
  }

  getById(review_id) {
    return this.db.prepare('SELECT * FROM ReviewContent WHERE review_id = ?').get(review_id);
  }

  getAll() {
    return this.db.prepare('SELECT * FROM ReviewContent').all();
  }

  update(review_id, punctuality, quality, friendliness, comments, datetime, verified) {
    this.db
      .prepare(
        'UPDATE ReviewContent SET punctuality = ?, quality = ?, friendliness = ?, comments = ?, datetime = ?, verified = ? WHERE review_id = ?'
      )
      .run(punctuality, quality, friendliness, comments, datetime, verified, review_id);
    return this.getById(review_id);
  }

  delete(review_id) {
    const old = this.getById(review_id);
    this.db.prepare('DELETE FROM ReviewContent WHERE review_id = ?').run(review_id);
    return old;
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('ReviewContentModel – database model tests', function () {
  let db;
  let reviewModel;

  // Shared seed data
  const SAMPLE = {
    punctuality:  4,
    quality:      5,
    friendliness: 3,
    comments:     'Great job!',
    datetime:     '2025-01-01T10:00:00.000Z',
    verified:     0,
  };

  before(function () {
    db = connectTestDatabase();
    reviewModel = new ReviewContentModel(db);
  });

  after(function () {
    db.close();
  });

  // ── CREATE ────────────────────────────────────────────────────────────────

  describe('create()', function () {
    it('should insert a new review and return an object with a numeric id', function () {
      const result = reviewModel.create(
        SAMPLE.punctuality,
        SAMPLE.quality,
        SAMPLE.friendliness,
        SAMPLE.comments,
        SAMPLE.datetime,
        SAMPLE.verified
      );

      assert.ok(result.id, 'Returned object should have a truthy id');
      assert.strictEqual(typeof result.id, 'number');
      assert.strictEqual(result.punctuality,  SAMPLE.punctuality);
      assert.strictEqual(result.quality,      SAMPLE.quality);
      assert.strictEqual(result.friendliness, SAMPLE.friendliness);
      assert.strictEqual(result.comments,     SAMPLE.comments);
      assert.strictEqual(result.verified,     SAMPLE.verified);
    });

    it('should persist the row so it can be found in the database', function () {
      const result = reviewModel.create(5, 5, 5, 'Perfect', '2025-02-01T00:00:00.000Z', 0);
      const row = db
        .prepare('SELECT * FROM ReviewContent WHERE review_id = ?')
        .get(result.id);

      assert.ok(row, 'Row should exist in the database after create');
      assert.strictEqual(row.punctuality,  5);
      assert.strictEqual(row.quality,      5);
      assert.strictEqual(row.friendliness, 5);
      assert.strictEqual(row.comments,     'Perfect');
    });

    it('should allow null / empty comments', function () {
      const result = reviewModel.create(3, 3, 3, null, '2025-03-01T00:00:00.000Z', 0);
      assert.ok(result.id, 'Should still create a review with null comments');
    });

    it('should auto-increment ids for successive inserts', function () {
      const r1 = reviewModel.create(1, 1, 1, 'first',  '2025-04-01T00:00:00.000Z', 0);
      const r2 = reviewModel.create(2, 2, 2, 'second', '2025-04-02T00:00:00.000Z', 0);
      assert.ok(r2.id > r1.id, 'Each new review should get a larger id than the previous one');
    });
  });

  // ── READ ──────────────────────────────────────────────────────────────────

  describe('getById()', function () {
    it('should return the correct review for a given id', function () {
      const created = reviewModel.create(4, 3, 5, 'Nice', '2025-05-01T00:00:00.000Z', 0);
      const fetched = reviewModel.getById(created.id);

      assert.ok(fetched, 'getById should return a row');
      assert.strictEqual(fetched.review_id,   created.id);
      assert.strictEqual(fetched.punctuality,  4);
      assert.strictEqual(fetched.quality,      3);
      assert.strictEqual(fetched.friendliness, 5);
      assert.strictEqual(fetched.comments,     'Nice');
    });

    it('should return undefined for a non-existent id', function () {
      const result = reviewModel.getById(999999);
      assert.strictEqual(result, undefined);
    });
  });

  describe('getAll()', function () {
    it('should return an array', function () {
      const rows = reviewModel.getAll();
      assert.ok(Array.isArray(rows));
    });

    it('should include all previously inserted reviews', function () {
      const before = reviewModel.getAll().length;
      reviewModel.create(2, 2, 2, 'extra', '2025-06-01T00:00:00.000Z', 0);
      const after = reviewModel.getAll().length;
      assert.strictEqual(after, before + 1, 'getAll should reflect newly inserted rows');
    });
  });

  // ── UPDATE ────────────────────────────────────────────────────────────────

  describe('update()', function () {
    it('should update the review fields and return the updated row', function () {
      const created = reviewModel.create(1, 1, 1, 'original', '2025-07-01T00:00:00.000Z', 0);
      const updated = reviewModel.update(
        created.id,
        5, 5, 5,
        'updated comment',
        '2025-07-02T00:00:00.000Z',
        1
      );

      assert.ok(updated, 'update() should return the updated row');
      assert.strictEqual(updated.punctuality,  5);
      assert.strictEqual(updated.quality,      5);
      assert.strictEqual(updated.friendliness, 5);
      assert.strictEqual(updated.comments,     'updated comment');
      assert.strictEqual(updated.verified,     1);
    });

    it('should persist the update to the database', function () {
      const created = reviewModel.create(2, 2, 2, 'before', '2025-08-01T00:00:00.000Z', 0);
      reviewModel.update(created.id, 4, 4, 4, 'after', '2025-08-02T00:00:00.000Z', 0);
      const row = reviewModel.getById(created.id);
      assert.strictEqual(row.comments, 'after');
      assert.strictEqual(row.punctuality, 4);
    });

    it('should mark a review as verified when verified flag is set to 1', function () {
      const created = reviewModel.create(3, 3, 3, 'unverified', '2025-09-01T00:00:00.000Z', 0);
      reviewModel.update(created.id, 3, 3, 3, 'unverified', '2025-09-01T00:00:00.000Z', 1);
      const row = reviewModel.getById(created.id);
      assert.strictEqual(row.verified, 1, 'Verified flag should be 1 after update');
    });
  });

  // ── DELETE ────────────────────────────────────────────────────────────────

  describe('delete()', function () {
    it('should delete the review and return its previous data', function () {
      const created = reviewModel.create(5, 4, 3, 'to delete', '2025-10-01T00:00:00.000Z', 0);
      const deleted = reviewModel.delete(created.id);

      assert.ok(deleted, 'delete() should return the row that was removed');
      assert.strictEqual(deleted.review_id, created.id);

      const afterDelete = reviewModel.getById(created.id);
      assert.strictEqual(afterDelete, undefined, 'Row should no longer exist after deletion');
    });

    it('should reduce the total row count by 1', function () {
      const before = reviewModel.getAll().length;
      const created = reviewModel.create(1, 2, 3, 'temp', '2025-11-01T00:00:00.000Z', 0);
      reviewModel.delete(created.id);
      const after = reviewModel.getAll().length;
      assert.strictEqual(after, before, 'Row count should return to its prior value after deletion');
    });
  });
});
