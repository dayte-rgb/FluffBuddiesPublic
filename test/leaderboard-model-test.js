'use strict';

const assert = require('assert');
const { connectTestDatabase } = require('./helpers/testDatabase');

// ─── Dependency-injected LeaderboardContentModel ─────────────────────────────

class LeaderboardContentModel {
  constructor(db) { this.db = db; }

  create(start_time, end_time, metric_id, badge_id) {
    const info = this.db
      .prepare('INSERT INTO LeaderboardContent (leaderboard_id, start_time, end_time, metric_id, badge_id) VALUES (NULL, ?, ?, ?, ?)')
      .run(start_time, end_time, metric_id, badge_id);
    return { id: info.lastInsertRowid, start_time, end_time, metric_id, badge_id };
  }

  getById(leaderboard_id) {
    return this.db.prepare('SELECT * FROM LeaderboardContent WHERE leaderboard_id = ?').get(leaderboard_id);
  }

  getAll() {
    return this.db.prepare('SELECT * FROM LeaderboardContent').all();
  }

  update(leaderboard_id, start_time, end_time, metric_id, badge_id) {
    this.db
      .prepare('UPDATE LeaderboardContent SET start_time = ?, end_time = ?, metric_id = ?, badge_id = ? WHERE leaderboard_id = ?')
      .run(start_time, end_time, metric_id, badge_id, leaderboard_id);
    return this.getById(leaderboard_id);
  }

  delete(leaderboard_id) {
    const old = this.getById(leaderboard_id);
    this.db.prepare('DELETE FROM LeaderboardContent WHERE leaderboard_id = ?').run(leaderboard_id);
    return old;
  }
}

// ─── Dependency-injected LeaderboardModel ────────────────────────────────────

class LeaderboardModel {
  constructor(db) {
    this.db = db;

    this._getLeaderboardStats = db.prepare(`
      SELECT
        u.username as worker_name,
        COUNT(*) as jobs_completed,
        ROUND((AVG(r.punctuality) + AVG(r.quality) + AVG(r.friendliness)) / 3.0, 2) as avg_rating
      FROM EmployeeJob ej
      JOIN JobContent jc ON ej.job_id = jc.job_id
      JOIN User u ON u.user_id = ej.employee_id
      LEFT JOIN JobReview jr ON jr.job_id = jc.job_id
      LEFT JOIN ReviewContent r ON r.review_id = jr.review_id
      WHERE jc.job_completed = 1
        AND ((@start IS NULL AND @end IS NULL) OR jc.datetime BETWEEN @start AND @end)
      GROUP BY u.user_id
      ORDER BY jobs_completed DESC, avg_rating DESC
    `);

    this._getTopRating = db.prepare(`
      SELECT
        u.user_id,
        ROUND((AVG(r.punctuality) + AVG(r.quality) + AVG(r.friendliness)) / 3.0, 2) as avg_rating
      FROM EmployeeJob ej
      JOIN JobContent jc ON ej.job_id = jc.job_id
      JOIN User u ON u.user_id = ej.employee_id
      LEFT JOIN JobReview jr ON jr.job_id = jc.job_id
      LEFT JOIN ReviewContent r ON r.review_id = jr.review_id
      WHERE jc.job_completed = 1
        AND ((@start IS NULL AND @end IS NULL) OR jc.datetime BETWEEN @start AND @end)
      GROUP BY u.user_id
      ORDER BY avg_rating DESC
      LIMIT @k
    `);

    this._getTopJobs = db.prepare(`
      SELECT
        u.user_id,
        COUNT(*) as jobs_completed
      FROM EmployeeJob ej
      JOIN JobContent jc ON ej.job_id = jc.job_id
      JOIN User u ON u.user_id = ej.employee_id
      WHERE jc.job_completed = 1
        AND (((@start IS NULL AND @end IS NULL) OR jc.datetime BETWEEN @start AND @end))
      GROUP BY u.user_id
      ORDER BY jobs_completed DESC
      LIMIT @k
    `);

    this._getCurrLeaderboard = db.prepare(
      'SELECT * FROM LeaderboardContent ORDER BY start_time DESC LIMIT 1'
    );
  }

  getCurrentLeaderboard()                        { return this._getCurrLeaderboard.get(); }
  getLeaderboardStats(start = null, end = null)  { return this._getLeaderboardStats.all({ start, end }); }
  getTopKRating(start = null, end = null, k = 10){ return this._getTopRating.all({ start, end, k }); }
  getTopKJobs(start = null, end = null, k = 10)  { return this._getTopJobs.all({ start, end, k }); }
}

// ─── Seed helpers ────────────────────────────────────────────────────────────

function seedUser(db, username) {
  const info = db
    .prepare('INSERT INTO User (username, password, phone_number, email, zipcode, profile_description, account_type, profile_picture_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(username, 'hashed_pw', '555-0000', `${username}@test.com`, '10001', '', 'user', null);
  return info.lastInsertRowid;
}

function seedJob(db, datetime = '2025-01-15 12:00:00', completed = 1) {
  const info = db
    .prepare('INSERT INTO JobContent (description, datetime, duration, zipcode, employee_num, job_filled, job_completed) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('Dog walk', datetime, 60, '10001', 1, 1, completed);
  return info.lastInsertRowid;
}

function seedEmployeeJob(db, jobId, userId) {
  db.prepare('INSERT INTO EmployeeJob (job_id, employee_id) VALUES (?, ?)').run(jobId, userId);
}

function seedReview(db, jobId, reviewerId, punctuality, quality, friendliness) {
  const rInfo = db
    .prepare('INSERT INTO ReviewContent (punctuality, quality, friendliness, comments, datetime, verified) VALUES (?, ?, ?, ?, ?, ?)')
    .run(punctuality, quality, friendliness, 'test', '2025-01-16T00:00:00.000Z', 0);
  const reviewId = rInfo.lastInsertRowid;
  db.prepare('INSERT INTO JobReview (review_id, job_id) VALUES (?, ?)').run(reviewId, jobId);
  db.prepare('INSERT INTO UserReview (review_id, user_id) VALUES (?, ?)').run(reviewId, reviewerId);
  return reviewId;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('LeaderboardContentModel – database model tests', function () {
  let db;
  let lbContent;

  before(function () {
    db = connectTestDatabase();
    lbContent = new LeaderboardContentModel(db);
  });

  after(function () { db.close(); });

  describe('create()', function () {
    it('should insert a leaderboard record and return it with a numeric id', function () {
      const result = lbContent.create('2025-01-01 00:00:00', '2025-01-31 23:59:59', 1, 1);
      assert.ok(result.id, 'Should return a truthy id');
      assert.strictEqual(typeof result.id, 'number');
      assert.strictEqual(result.metric_id, 1);
    });

    it('should persist the row to the database', function () {
      const result = lbContent.create('2025-02-01 00:00:00', '2025-02-28 23:59:59', 1, 2);
      const row = db.prepare('SELECT * FROM LeaderboardContent WHERE leaderboard_id = ?').get(result.id);
      assert.ok(row, 'Row should be findable after insert');
      assert.strictEqual(row.metric_id, 1);
    });
  });

  describe('getById()', function () {
    it('should retrieve the correct leaderboard by id', function () {
      const created = lbContent.create('2025-03-01 00:00:00', null, 1, 1);
      const fetched  = lbContent.getById(created.id);
      assert.ok(fetched, 'getById should return a row');
      assert.strictEqual(fetched.leaderboard_id, created.id);
    });

    it('should return undefined for a non-existent id', function () {
      assert.strictEqual(lbContent.getById(999999), undefined);
    });
  });

  describe('update()', function () {
    it('should update the end_time and return the refreshed row', function () {
      const created = lbContent.create('2025-04-01 00:00:00', null, 1, 1);
      const updated  = lbContent.update(created.id, created.start_time, '2025-04-30 23:59:59', 1, 1);
      assert.strictEqual(updated.end_time, '2025-04-30 23:59:59');
    });
  });

  describe('delete()', function () {
    it('should remove the row and return the deleted data', function () {
      const created = lbContent.create('2025-05-01 00:00:00', null, 1, 1);
      const deleted  = lbContent.delete(created.id);
      assert.ok(deleted, 'delete() should return the old row');
      assert.strictEqual(deleted.leaderboard_id, created.id);
      assert.strictEqual(lbContent.getById(created.id), undefined, 'Row should be gone');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('LeaderboardModel – query / logic tests', function () {
  let db;
  let lbModel;
  let lbContent;

  // IDs set up by seedData()
  let user1Id, user2Id;

  before(function () {
    db = connectTestDatabase();
    lbModel  = new LeaderboardModel(db);
    lbContent = new LeaderboardContentModel(db);

    // ── Seed user 1: 3 completed jobs, avg rating 5 ──────────────────────
    user1Id = seedUser(db, 'alice');
    for (let i = 0; i < 3; i++) {
      const jId = seedJob(db, '2025-06-10 10:00:00', 1);
      seedEmployeeJob(db, jId, user1Id);
      seedReview(db, jId, user1Id, 5, 5, 5);
    }

    // ── Seed user 2: 1 completed job, avg rating 2 ───────────────────────
    user2Id = seedUser(db, 'bob');
    const jId = seedJob(db, '2025-06-15 14:00:00', 1);
    seedEmployeeJob(db, jId, user2Id);
    seedReview(db, jId, user2Id, 2, 2, 2);

    // ── Seed user 3: 1 incomplete job (should NOT appear in stats) ───────
    const user3Id = seedUser(db, 'charlie');
    const jId2 = seedJob(db, '2025-06-20 09:00:00', 0); // job_completed = 0
    seedEmployeeJob(db, jId2, user3Id);
  });

  after(function () { db.close(); });

  // ── getCurrentLeaderboard ─────────────────────────────────────────────────

  describe('getCurrentLeaderboard()', function () {
    it('should return undefined when no leaderboard exists', function () {
      // Fresh db has no leaderboard rows
      const emptyDb = connectTestDatabase();
      const m = new LeaderboardModel(emptyDb);
      assert.strictEqual(m.getCurrentLeaderboard(), undefined);
      emptyDb.close();
    });

    it('should return the most recently created leaderboard', function () {
      lbContent.create('2025-01-01 00:00:00', '2025-06-30 23:59:59', 1, 1);
      const lb = lbModel.getCurrentLeaderboard();
      assert.ok(lb, 'Should return a leaderboard row');
      assert.ok(lb.leaderboard_id, 'Row should have a leaderboard_id');
    });
  });

  // ── getLeaderboardStats ───────────────────────────────────────────────────

  describe('getLeaderboardStats()', function () {
    it('should return an array', function () {
      const stats = lbModel.getLeaderboardStats();
      assert.ok(Array.isArray(stats));
    });

    it('should include users who completed jobs', function () {
      const stats = lbModel.getLeaderboardStats();
      const names = stats.map(r => r.worker_name);
      assert.ok(names.includes('alice'), 'alice should appear in stats');
      assert.ok(names.includes('bob'),   'bob should appear in stats');
    });

    it('should NOT include users with only incomplete jobs', function () {
      const stats = lbModel.getLeaderboardStats();
      const names = stats.map(r => r.worker_name);
      assert.ok(!names.includes('charlie'), 'charlie has no completed jobs and should be excluded');
    });

    it('should report the correct jobs_completed count for alice (3)', function () {
      const stats  = lbModel.getLeaderboardStats();
      const alice  = stats.find(r => r.worker_name === 'alice');
      assert.ok(alice, 'alice entry should exist');
      assert.strictEqual(alice.jobs_completed, 3);
    });

    it('should order results so alice (3 jobs) comes before bob (1 job)', function () {
      const stats = lbModel.getLeaderboardStats();
      const aliceIdx = stats.findIndex(r => r.worker_name === 'alice');
      const bobIdx   = stats.findIndex(r => r.worker_name === 'bob');
      assert.ok(aliceIdx < bobIdx, 'alice should rank above bob by jobs completed');
    });

    it('should return an empty array when no jobs match the date range', function () {
      const stats = lbModel.getLeaderboardStats('1970-01-01 00:00:00', '1970-01-02 00:00:00');
      assert.strictEqual(stats.length, 0);
    });

    it('should correctly filter results within a date range', function () {
      // Only jobs on 2025-06-10 qualify (alice's 3 jobs)
      const stats = lbModel.getLeaderboardStats('2025-06-10 00:00:00', '2025-06-12 00:00:00');
      const names = stats.map(r => r.worker_name);
      assert.ok(names.includes('alice'),  'alice has jobs in this range');
      assert.ok(!names.includes('bob'),   'bob has no jobs in this range');
    });
  });

  // ── getTopKRating ─────────────────────────────────────────────────────────

  describe('getTopKRating()', function () {
    it('should return at most k results', function () {
      const top1 = lbModel.getTopKRating(null, null, 1);
      assert.strictEqual(top1.length, 1);
    });

    it('should place the highest-rated user first', function () {
      const top = lbModel.getTopKRating(null, null, 10);
      assert.strictEqual(top[0].user_id, user1Id, 'alice (avg 5) should be top-rated');
    });

    it('should return an empty array when no completed jobs exist in the range', function () {
      const top = lbModel.getTopKRating('1970-01-01 00:00:00', '1970-01-02 00:00:00', 10);
      assert.strictEqual(top.length, 0);
    });
  });

  // ── getTopKJobs ───────────────────────────────────────────────────────────

  describe('getTopKJobs()', function () {
    it('should return at most k results', function () {
      const top1 = lbModel.getTopKJobs(null, null, 1);
      assert.strictEqual(top1.length, 1);
    });

    it('should place the user with the most completed jobs first', function () {
      const top = lbModel.getTopKJobs(null, null, 10);
      assert.strictEqual(top[0].user_id, user1Id, 'alice (3 jobs) should be first by jobs');
    });

    it('should return an empty array when no completed jobs exist in the range', function () {
      const top = lbModel.getTopKJobs('1970-01-01 00:00:00', '1970-01-02 00:00:00', 10);
      assert.strictEqual(top.length, 0);
    });
  });
});
