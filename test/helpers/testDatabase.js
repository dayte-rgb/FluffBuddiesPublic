/**
 * testDatabase.js
 *
 * Creates a fresh in-memory SQLite database for every test run.
 * The schema mirrors the production tables that are exercised by the
 * models under test (User, ReviewContent, JobReview, UserReview,
 * JobContent, EmployeeJob, EmployerJob, LeaderboardContent).
 *
 * Usage:
 *   const { connectTestDatabase } = require('./helpers/testDatabase');
 *   const db = connectTestDatabase();   // call once per test file
 *   db.close();                         // call in after()
 */

'use strict';

const Database = require('better-sqlite3');

function connectTestDatabase() {
  const db = new Database(':memory:');

  // Enforce foreign keys (matches production PRAGMA)
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    -- ── Users ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS User (
      user_id               INTEGER PRIMARY KEY AUTOINCREMENT,
      username              TEXT    NOT NULL UNIQUE,
      password              TEXT    NOT NULL,
      phone_number          TEXT,
      email                 TEXT    NOT NULL UNIQUE,
      zipcode               TEXT,
      profile_description   TEXT,
      account_type          TEXT,
      profile_picture_link  TEXT
    );

    -- ── Job content ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS JobContent (
      job_id        INTEGER PRIMARY KEY AUTOINCREMENT,
      description   TEXT    NOT NULL,
      datetime      TEXT    NOT NULL,
      duration      INTEGER NOT NULL,
      zipcode       TEXT,
      employee_num  INTEGER,
      job_filled    INTEGER DEFAULT 0,
      job_completed INTEGER DEFAULT 0
    );

    -- ── Employee ↔ Job (bookings) ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS EmployeeJob (
      employee_job_id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id          INTEGER NOT NULL REFERENCES JobContent(job_id),
      employee_id     INTEGER NOT NULL REFERENCES User(user_id)
    );

    -- ── Employer ↔ Job (postings) ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS EmployerJob (
      employer_job_id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id          INTEGER NOT NULL REFERENCES JobContent(job_id),
      employer_id     INTEGER NOT NULL REFERENCES User(user_id)
    );

    -- ── Review content ────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS ReviewContent (
      review_id   INTEGER PRIMARY KEY AUTOINCREMENT,
      punctuality INTEGER NOT NULL,
      quality     INTEGER NOT NULL,
      friendliness INTEGER NOT NULL,
      comments    TEXT,
      datetime    TEXT    NOT NULL,
      verified    INTEGER DEFAULT 0
    );

    -- ── Job ↔ Review ──────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS JobReview (
      review_id INTEGER PRIMARY KEY REFERENCES ReviewContent(review_id),
      job_id    INTEGER NOT NULL REFERENCES JobContent(job_id)
    );

    -- ── User ↔ Review (reviewer) ──────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS UserReview (
      review_id INTEGER PRIMARY KEY REFERENCES ReviewContent(review_id),
      user_id   INTEGER NOT NULL REFERENCES User(user_id)
    );

    -- ── Leaderboard ───────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS LeaderboardContent (
      leaderboard_id INTEGER PRIMARY KEY AUTOINCREMENT,
      start_time     TEXT,
      end_time       TEXT,
      metric_id      INTEGER,
      badge_id       INTEGER
    );
  `);

  return db;
}

module.exports = { connectTestDatabase };
