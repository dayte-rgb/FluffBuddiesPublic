const session = require('express-session');
const SqliteStore = require('connect-sqlite3')(session);
const path = require('path');

// Create session store that persists to SQLite database
const sessionStore = new SqliteStore({
  db: 'sessions.db',
  dir: path.join(__dirname, '../'),
  table: 'sessions',
  concurrentDb: true,
  expired: {
    intervalMs: 86400000, // Check for expired sessions every 24 hours
    sqlite_vacuum: true
  }
});

const sessionMiddleware = session({
  store: sessionStore,
  secret: 'fluff-buddies-secret-key-2025', // Change this to a more secure secret eventually
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true, // Prevents client-side JS from accessing the cookie (XSS attack)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
});

module.exports = {
  sessionMiddleware,
  sessionStore
};
